export type TimerPhase = "idle" | "preparation" | "exercise" | "rest" | "finished";

export interface TimerConfig {
    preparationTime: number;
    exerciseTime: number;
    restTime: number;
    rounds: number;
}

export interface TimerState {
    phase: TimerPhase;
    round: number;
    secondsLeft: number;
    isRunning: boolean;
}
