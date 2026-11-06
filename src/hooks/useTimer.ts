import { useCallback, useEffect, useRef, useState } from "react";

import type { TimerConfig, TimerPhase } from "../types/timer";

const DEFAULT_CONFIG: TimerConfig = {
    preparationTime: 5,
    exerciseTime: 300,
    restTime: 60,
    rounds: 20
};

const PHASE_LABELS: Record<TimerPhase, string> = {
    idle: "Pronto para começar",
    preparation: "Preparação",
    exercise: "Exercício",
    rest: "Descanso",
    finished: "Treino concluído"
};

export function useTimer() {
    const [config, setConfig] = useState<TimerConfig>(() => {
        const saved = localStorage.getItem("training-timer-config");

        if (saved) {
            try {
                return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
            } catch {
                return DEFAULT_CONFIG;
            }
        }

        return DEFAULT_CONFIG;
    });

    const [phase, setPhase] = useState<TimerPhase>("idle");
    const [round, setRound] = useState(1);
    const [secondsLeft, setSecondsLeft] = useState(DEFAULT_CONFIG.preparationTime);
    const [isRunning, setIsRunning] = useState(false);

    const deadlineRef = useRef<number | null>(null);
    const remainingRef = useRef(secondsLeft * 1000);

    const configRef = useRef(config);
    const phaseRef = useRef<TimerPhase>("idle");
    const roundRef = useRef(1);

    const audioContextRef = useRef<AudioContext | null>(null);
    const lastCountdownRef = useRef<string | null>(null);

    useEffect(() => {
        configRef.current = config;

        localStorage.setItem("training-timer-config", JSON.stringify(config));
    }, [config]);

    const getPhaseDuration = useCallback((currentPhase: TimerPhase) => {
        const currentConfig = configRef.current;

        switch (currentPhase) {
            case "preparation":
                return currentConfig.preparationTime;

            case "exercise":
                return currentConfig.exerciseTime;

            case "rest":
                return currentConfig.restTime;

            default:
                return 0;
        }
    }, []);

    const playSound = useCallback((frequency = 800, volume = 0.3, duration = 0.4) => {
        try {
            const AudioContextClass =
                window.AudioContext ||
                (
                    window as typeof window & {
                        webkitAudioContext?: typeof AudioContext;
                    }
                ).webkitAudioContext;

            if (!AudioContextClass) return;

            const audioContext = audioContextRef.current ?? new AudioContextClass();

            audioContextRef.current = audioContext;

            if (audioContext.state === "suspended") {
                void audioContext.resume();
            }

            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = "sine";

            gain.gain.setValueAtTime(volume, audioContext.currentTime);

            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            console.error("Erro ao reproduzir som:", error);
        }
    }, []);

    const updatePhase = useCallback(
        (nextPhase: TimerPhase, nextRound: number) => {
            phaseRef.current = nextPhase;
            roundRef.current = nextRound;

            setPhase(nextPhase);
            setRound(nextRound);

            const duration = getPhaseDuration(nextPhase);

            remainingRef.current = duration * 1000;
            setSecondsLeft(duration);

            if (nextPhase === "preparation") {
                playSound(600, 0.8, 0.6);
            } else if (nextPhase === "exercise") {
                playSound(1200, 0.9, 4.0);
            } else if (nextPhase === "rest") {
                playSound(1200, 0.9, 4.0);
            } else if (nextPhase === "finished") {
                playSound(1200, 1.00, 3.0);
            }
        },
        [getPhaseDuration, playSound]
    );

    const advancePhase = useCallback(() => {
        const currentPhase = phaseRef.current;
        const currentRound = roundRef.current;
        const totalRounds = configRef.current.rounds;

        if (currentPhase === "preparation") {
            updatePhase("exercise", currentRound);
            return;
        }

        if (currentPhase === "exercise") {
            if (currentRound >= totalRounds) {
                updatePhase("finished", currentRound);
                setIsRunning(false);
                return;
            }

            if (configRef.current.restTime > 0) {
                updatePhase("rest", currentRound);
            } else {
                updatePhase("exercise", currentRound + 1);
            }

            return;
        }

        if (currentPhase === "rest") {
            updatePhase("exercise", currentRound + 1);
        }
    }, [updatePhase]);

    const start = useCallback(() => {
        if (phaseRef.current === "finished") {
            return;
        }

        if (phaseRef.current === "idle") {
            const initialPhase = configRef.current.preparationTime > 0 ? "preparation" : "exercise";

            updatePhase(initialPhase, 1);

            remainingRef.current = getPhaseDuration(initialPhase) * 1000;
        }

        deadlineRef.current = Date.now() + remainingRef.current;

        setIsRunning(true);
    }, [getPhaseDuration, updatePhase]);

    const pause = useCallback(() => {
        if (!deadlineRef.current) return;

        remainingRef.current = Math.max(0, deadlineRef.current - Date.now());

        setSecondsLeft(Math.ceil(remainingRef.current / 1000));

        deadlineRef.current = null;

        setIsRunning(false);
    }, []);

    const reset = useCallback(() => {
        deadlineRef.current = null;
        remainingRef.current = configRef.current.preparationTime * 1000;

        phaseRef.current = "idle";
        roundRef.current = 1;

        setPhase("idle");
        setRound(1);
        setSecondsLeft(configRef.current.preparationTime);
        setIsRunning(false);
    }, []);

    const skip = useCallback(() => {
        if (!isRunning) return;

        advancePhase();

        if (phaseRef.current === "finished") {
            deadlineRef.current = null;
            return;
        }

        remainingRef.current = getPhaseDuration(phaseRef.current) * 1000;

        deadlineRef.current = Date.now() + remainingRef.current;
    }, [advancePhase, getPhaseDuration, isRunning]);

    const updateConfig = useCallback(
        (newConfig: TimerConfig) => {
            if (isRunning) return;

            const normalizedConfig = {
                preparationTime: Math.max(0, Math.floor(newConfig.preparationTime)),
                exerciseTime: Math.max(1, Math.floor(newConfig.exerciseTime)),
                restTime: Math.max(0, Math.floor(newConfig.restTime)),
                rounds: Math.max(1, Math.floor(newConfig.rounds))
            };

            setConfig(normalizedConfig);
            configRef.current = normalizedConfig;

            reset();

            remainingRef.current = normalizedConfig.preparationTime * 1000;

            setSecondsLeft(normalizedConfig.preparationTime);
        },
        [isRunning, reset]
    );

    useEffect(() => {
        if (!isRunning) return;

        const interval = window.setInterval(() => {
            if (deadlineRef.current === null) return;

            const remaining = deadlineRef.current - Date.now();

            if (remaining <= 0) {
                advancePhase();

                if (phaseRef.current === "finished") {
                    deadlineRef.current = null;
                    return;
                }

                remainingRef.current = getPhaseDuration(phaseRef.current) * 1000;

                deadlineRef.current = Date.now() + remainingRef.current;

                setSecondsLeft(Math.ceil(remainingRef.current / 1000));

                return;
            }

            remainingRef.current = remaining;

            setSecondsLeft(Math.ceil(remaining / 1000));
        }, 100);

        return () => window.clearInterval(interval);
    }, [isRunning, advancePhase, getPhaseDuration]);

    useEffect(() => {
        if (!isRunning || secondsLeft <= 0 || secondsLeft > 3) {
            return;
        }

        const countdownKey = `${phase}-${round}-${secondsLeft}`;

        if (lastCountdownRef.current === countdownKey) {
            return;
        }

        lastCountdownRef.current = countdownKey;

        // Bip dos últimos 3 segundos
        playSound(700, 0.35, 0.12);
    }, [secondsLeft, isRunning, phase, round, playSound]);

    const phaseLabel = PHASE_LABELS[phase];

    return {
        config,
        phase,
        phaseLabel,
        round,
        secondsLeft,
        isRunning,
        start,
        pause,
        reset,
        skip,
        updateConfig
    };
}
