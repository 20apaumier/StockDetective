import React from 'react';

interface IndicatorSelectorProps {
    selectedIndicators: string[];
    onChangeIndicators: (indicators: string[]) => void;
}

const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({
    selectedIndicators,
    onChangeIndicators,
}) => {
    const indicators = ['RSI', 'MACD', 'Moving Average'];

    const handleChange = (indicator: string) => {
        if (selectedIndicators.includes(indicator)) {
            onChangeIndicators(selectedIndicators.filter((i) => i !== indicator));
        } else {
            onChangeIndicators([...selectedIndicators, indicator]);
        }
    };

    return (
        <div>
            <h3>Select Technical Indicators:</h3>
            {indicators.map((indicator) => (
                <label key={indicator}>
                    <input
                        type="checkbox"
                        value={indicator}
                        checked={selectedIndicators.includes(indicator)}
                        onChange={() => handleChange(indicator)}
                    />
                    {indicator}
                </label>
            ))}
        </div>
    );
};

export default IndicatorSelector;