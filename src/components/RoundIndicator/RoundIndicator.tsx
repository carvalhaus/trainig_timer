import "./RoundIndicator.css";

interface RoundIndicatorProps {
    currentRound: number;
    totalRounds: number;
}

export default function RoundIndicator({ currentRound, totalRounds }: RoundIndicatorProps) {
    return (
        <div className="round-indicator">
            <div className="round-header">
                <span>Progresso dos rounds</span>

                <strong>
                    {Math.min(currentRound, totalRounds)} / {totalRounds}
                </strong>
            </div>

            <div className="round-bars">
                {Array.from({ length: totalRounds }, (_, index) => {
                    const roundNumber = index + 1;

                    let status = "pending";

                    if (roundNumber < currentRound) {
                        status = "completed";
                    } else if (roundNumber === currentRound) {
                        status = "current";
                    }

                    return (
                        <div
                            key={roundNumber}
                            className={`round-bar ${status}`}
                            title={`Round ${roundNumber}`}
                        />
                    );
                })}
            </div>
        </div>
    );
}
