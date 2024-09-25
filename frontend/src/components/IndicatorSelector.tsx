import React from 'react';

// props interface
interface IndicatorSelectorProps {
    selectedIndicators: string[]; // string array of seleceted indicators
    onChangeIndicators: (indicators: string[]) => void; // callback function to update selectedIndicators
}

// functional component for selecting technical indicators
const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({
    selectedIndicators,
    onChangeIndicators,
}) => {
    // array of available indicators
    const indicators = ['RSI', 'MACD', 'Moving Average'];

    // function to handle the change of indicators
    const handleChange = (indicator: string) => {
        if (selectedIndicators.includes(indicator)) {
            // if an indicator is already selected, remove it from the list
            onChangeIndicators(selectedIndicators.filter((i) => i !== indicator));
        } else {
            // if the indicator is not selected, add it to the list
            onChangeIndicators([...selectedIndicators, indicator]);
        }
    };

    return (
        <div>
            <h3>Select Technical Indicators:</h3>
            {/* checkbox for each available indicator */}
            {indicators.map((indicator) => (
                <label key={indicator}>
                    <input
                        type="checkbox"
                        value={indicator}
                        checked={selectedIndicators.includes(indicator)}
                        onChange={() => handleChange(indicator)}
                    />
                    {indicator} {/* Display the indicator name next to the checkbox */}
                </label>
            ))}
        </div>
    );
};

export default IndicatorSelector;