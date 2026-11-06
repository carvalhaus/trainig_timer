import { Settings2 } from "lucide-react";

import Timer from "./components/Timer/Timer";
import TimerSettings from "./components/TimerSettings/TimerSettings";

import { useTimer } from "./hooks/useTimer";

import "./App.css";

function App() {
    const {
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
    } = useTimer();

    return (
        <main className="app-container">
            <div className="app-content">
                <div className="app-title">
                    <div>
                        <h2>Seu treino</h2>
                        <p>Configure os intervalos e comece a treinar.</p>
                    </div>

                    <Settings2 size={23} />
                </div>

                <div className="app-grid">
                    <Timer
                        phase={phase}
                        phaseLabel={phaseLabel}
                        secondsLeft={secondsLeft}
                        round={round}
                        totalRounds={config.rounds}
                        isRunning={isRunning}
                        onStart={start}
                        onPause={pause}
                        onReset={reset}
                        onSkip={skip}
                    />

                    <TimerSettings config={config} disabled={isRunning} onChange={updateConfig} />
                </div>
            </div>

            <footer className="app-footer">
                <p>TRAINING TIMER © 2026</p>
                <span>Desenvolvido para seus treinos.</span>
            </footer>
        </main>
    );
}

export default App;
