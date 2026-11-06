import { Clock, Dumbbell, Coffee, Repeat } from "lucide-react";

import type { TimerConfig } from "../../types/timer";

import "./TimerSettings.css";

interface TimerSettingsProps {
    config: TimerConfig;
    disabled: boolean;
    onChange: (config: TimerConfig) => void;
}

interface TimeInputProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    disabled: boolean;
    onChange: (value: number) => void;
    min?: number;
}

function TimeInput({ label, value, icon, disabled, onChange, min = 0 }: TimeInputProps) {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;

    const handleChange = (type: "minutes" | "seconds", input: number) => {
        const safeValue = Math.max(0, Math.floor(input));

        const newValue =
            type === "minutes" ? safeValue * 60 + seconds : minutes * 60 + Math.min(safeValue, 59);

        onChange(Math.max(min, newValue));
    };

    return (
        <div className="setting-field">
            <div className="setting-label">
                <span className="setting-icon">{icon}</span>
                <label>{label}</label>
            </div>

            <div className="time-inputs">
                <div className="time-input-group">
                    <input
                        type="number"
                        min={0}
                        value={minutes}
                        disabled={disabled}
                        onChange={(e) => handleChange("minutes", Number(e.target.value))}
                    />
                    <span>min</span>
                </div>

                <span className="time-separator">:</span>

                <div className="time-input-group">
                    <input
                        type="number"
                        min={0}
                        max={59}
                        value={seconds.toString().padStart(2, "0")}
                        disabled={disabled}
                        onChange={(e) => handleChange("seconds", Number(e.target.value))}
                    />
                    <span>seg</span>
                </div>
            </div>
        </div>
    );
}

export default function TimerSettings({ config, disabled, onChange }: TimerSettingsProps) {
    const updateField = (field: keyof TimerConfig, value: number) => {
        onChange({
            ...config,
            [field]: value
        });
    };

    return (
        <section className="settings-card">
            <div className="settings-header">
                <div>
                    <h2>Configuração do treino</h2>
                    <p>Personalize seus intervalos</p>
                </div>

                <Clock size={22} />
            </div>

            <div className="settings-fields">
                <TimeInput
                    label="Preparação"
                    value={config.preparationTime}
                    icon={<Clock size={18} />}
                    disabled={disabled}
                    onChange={(value) => updateField("preparationTime", value)}
                />

                <TimeInput
                    label="Exercício"
                    value={config.exerciseTime}
                    icon={<Dumbbell size={18} />}
                    disabled={disabled}
                    min={1}
                    onChange={(value) => updateField("exerciseTime", value)}
                />

                <TimeInput
                    label="Descanso"
                    value={config.restTime}
                    icon={<Coffee size={18} />}
                    disabled={disabled}
                    onChange={(value) => updateField("restTime", value)}
                />

                <div className="setting-field">
                    <div className="setting-label">
                        <span className="setting-icon">
                            <Repeat size={18} />
                        </span>
                        <label htmlFor="rounds">Quantidade de rounds</label>
                    </div>

                    <input
                        id="rounds"
                        className="rounds-input"
                        type="number"
                        min={1}
                        max={99}
                        value={config.rounds}
                        disabled={disabled}
                        onChange={(e) =>
                            updateField(
                                "rounds",
                                Math.min(99, Math.max(1, Number(e.target.value) || 1))
                            )
                        }
                    />
                </div>
            </div>

            {disabled && (
                <p className="settings-hint">
                    Pause ou reinicie o treino para alterar as configurações.
                </p>
            )}
        </section>
    );
}
