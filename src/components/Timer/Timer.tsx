import {
    Play,
    Pause,
    RotateCcw,
    SkipForward,
    Dumbbell,
    Coffee,
    Clock,
    CheckCircle
} from "lucide-react";

import type { TimerPhase } from "../../types/timer";

import RoundIndicator from "../RoundIndicator/RoundIndicator";

import "./Timer.css";

interface TimerProps {
    phase: TimerPhase;
    phaseLabel: string;
    secondsLeft: number;
    round: number;
    totalRounds: number;
    isRunning: boolean;
    preparationTime: number;
    exerciseTime: number;
    restTime: number;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onSkip: () => void;
}

const PHASE_COLORS: Record<TimerPhase, string> = {
    idle: "#038291",
    preparation: "#038291",
    exercise: "#FF9E01",
    rest: "#999999",
    finished: "#22c55e"
};

const PHASE_ICONS = {
    idle: <Clock size={20} />,
    preparation: <Clock size={20} />,
    exercise: <Dumbbell size={20} />,
    rest: <Coffee size={20} />,
    finished: <CheckCircle size={20} />
};

export default function Timer({
    phase,
    phaseLabel,
    secondsLeft,
    round,
    totalRounds,
    isRunning,
    preparationTime,
    exerciseTime,
    restTime,
    onStart,
    onPause,
    onReset,
    onSkip
}: TimerProps) {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    const formattedTime = [
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0")
    ].join(":");

    const currentDuration =
        phase === "preparation" ? preparationTime : phase === "rest" ? restTime : exerciseTime;

    const progress = currentDuration > 0 ? (secondsLeft / currentDuration) * 100 : 0;

    const circumference = 2 * Math.PI * 115;
    const strokeOffset =
        circumference - (Math.max(0, Math.min(100, progress)) / 100) * circumference;

    const color = PHASE_COLORS[phase];

    return (
        <section className="timer-card" style={{ "--phase-color": color } as React.CSSProperties}>
            <div className="timer-phase">
                <span className="phase-icon">{PHASE_ICONS[phase]}</span>

                <span>{phaseLabel}</span>
            </div>

            <div className="timer-circle">
                <svg viewBox="0 0 260 260">
                    <circle className="timer-circle-background" cx="130" cy="130" r="115" />

                    <circle
                        className="timer-circle-progress"
                        cx="130"
                        cy="130"
                        r="115"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeOffset}
                    />
                </svg>

                <div className="timer-time">
                    {phase === "finished" ? (
                        <CheckCircle size={58} color={color} />
                    ) : (
                        <>
                            <strong>{formattedTime}</strong>
                            <span>RESTANTE</span>
                        </>
                    )}
                </div>
            </div>

            <div className="timer-round">
                <span>ROUND</span>
                <strong>
                    {Math.min(round, totalRounds)}
                    <small> / {totalRounds}</small>
                </strong>
            </div>

            <RoundIndicator
                currentRound={phase === "finished" ? totalRounds + 1 : round}
                totalRounds={totalRounds}
            />

            <div className="timer-controls">
                {isRunning ? (
                    <button className="timer-button primary" onClick={onPause}>
                        <Pause size={21} />
                        Pausar
                    </button>
                ) : (
                    <button
                        className="timer-button primary"
                        onClick={onStart}
                        disabled={phase === "finished"}
                    >
                        <Play size={21} />
                        {phase === "idle" ? "Iniciar treino" : "Continuar"}
                    </button>
                )}

                <button
                    className="timer-button secondary"
                    onClick={onReset}
                    title="Reiniciar treino"
                >
                    <RotateCcw size={20} />
                </button>

                <button
                    className="timer-button secondary"
                    onClick={onSkip}
                    disabled={!isRunning}
                    title="Pular fase"
                >
                    <SkipForward size={20} />
                </button>
            </div>
        </section>
    );
}
