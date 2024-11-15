// src/components/TradeParametersComponent.tsx
import React, { useState, useEffect } from 'react';

// Define the shape of the trade parameters for each indicator
export interface TradeParameters {
    [indicator: string]: {
        buyThreshold: number;
        buyCondition: '<' | '>';
        sellThreshold: number;
        sellCondition: '<' | '>';
        tradeAmount: number;
        tradeAmountType: 'shares' | 'dollars';
    };
}

interface TradeParametersComponentProps {
    // Callback to notify parent component of parameter changes
    onParametersChange: (params: TradeParameters) => void;
}

const TradeParametersComponent: React.FC<TradeParametersComponentProps> = ({
    onParametersChange,
}) => {
    // List of indicators to show in the UI
    const indicators = ['MACD', 'RSI', 'SMA']; // Add more indicators as needed

    // Initialize parameters for each indicator directly in useState
    const initialParams: TradeParameters = {};
    indicators.forEach((indicator) => {
        initialParams[indicator] = {
            buyThreshold: 0,
            buyCondition: '<',
            sellThreshold: 0,
            sellCondition: '>',
            tradeAmount: 0,
            tradeAmountType: 'shares',
        };
    });

    // State to store the trade parameters for each indicator
    const [parameters, setParameters] = useState<TradeParameters>(initialParams);

    // Handle changes to input fields and update the corresponding parameter
    const handleInputChange = (
        indicator: string,
        field: keyof TradeParameters[string],
        value: string | number
    ) => {
        let newValue: number | string;

        if (field === 'buyThreshold' || field === 'sellThreshold' || field === 'tradeAmount') {
            if (typeof value === 'string') {
                const parsed = parseFloat(value);
                newValue = isNaN(parsed) ? 0 : parsed;
            } else {
                newValue = value;
            }
        } else {
            newValue = value;
        }

        setParameters((prev) => ({
            ...prev, // Spread the existing parameters
            [indicator]: {
                ...prev[indicator], // Update only the specific indicator's field
                [field]: newValue,
            },
        }));
    };

    // Notify parent component when trade parameters change
    useEffect(() => {
        if (typeof onParametersChange === 'function') {
            onParametersChange(parameters); // Call the callback with the updated parameters
        } else {
            console.error('onParametersChange is not a function');
        }
    }, [parameters, onParametersChange]);

    return (
        <div className="trade-parameters">
            <h3>Trade Parameters</h3>
            <table>
                <thead>
                    <tr>
                        <th>Indicator</th>
                        <th>Buy Condition</th>
                        <th>Buy Threshold</th>
                        <th>Sell Condition</th>
                        <th>Sell Threshold</th>
                        <th>Trade Amount</th>
                        <th>Amount Type</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Loop through each indicator and render the respective controls */}
                    {indicators.map((indicator) => (
                        <tr key={indicator}>
                            <td>{indicator}</td>
                            {/* Buy Condition Dropdown */}
                            <td>
                                <select
                                    value={parameters[indicator].buyCondition}
                                    onChange={(e) =>
                                        handleInputChange(
                                            indicator,
                                            'buyCondition',
                                            e.target.value as '<' | '>'
                                        )
                                    }
                                    aria-label={`${indicator} Buy Condition`}
                                >
                                    <option value="<">Less Than</option>
                                    <option value=">">Greater Than</option>
                                </select>
                            </td>
                            {/* Buy Threshold Input */}
                            <td>
                                <input
                                    type="number"
                                    value={parameters[indicator].buyThreshold}
                                    onChange={(e) =>
                                        handleInputChange(
                                            indicator,
                                            'buyThreshold',
                                            e.target.value
                                        )
                                    }
                                    aria-label={`${indicator} Buy Threshold`}
                                />
                            </td>

                            {/* Sell Condition Dropdown */}
                            <td>
                                <select
                                    value={parameters[indicator].sellCondition}
                                    onChange={(e) =>
                                        handleInputChange(
                                            indicator,
                                            'sellCondition',
                                            e.target.value as '<' | '>'
                                        )
                                    }
                                    aria-label={`${indicator} Sell Condition`}
                                >
                                    <option value="<">Less Than</option>
                                    <option value=">">Greater Than</option>
                                </select>
                            </td>
                            {/* Sell Threshold Input */}
                            <td>
                                <input
                                    type="number"
                                    value={parameters[indicator].sellThreshold}
                                    onChange={(e) =>
                                        handleInputChange(
                                            indicator,
                                            'sellThreshold',
                                            e.target.value
                                        )
                                    }
                                    aria-label={`${indicator} Sell Threshold`}
                                />
                            </td>

                            {/* Trade Amount Input */}
                            <td>
                                <input
                                    type="number"
                                    value={parameters[indicator].tradeAmount}
                                    onChange={(e) =>
                                        handleInputChange(
                                            indicator,
                                            'tradeAmount',
                                            e.target.value
                                        )
                                    }
                                    aria-label={`${indicator} Trade Amount`}
                                />
                            </td>
                            {/* Trade Amount Type Dropdown */}
                            <td>
                                <select
                                    value={parameters[indicator].tradeAmountType}
                                    onChange={(e) =>
                                        handleInputChange(
                                            indicator,
                                            'tradeAmountType',
                                            e.target.value as 'shares' | 'dollars'
                                        )
                                    }
                                    aria-label={`${indicator} Trade Amount Type`}
                                >
                                    <option value="shares">Shares</option>
                                    <option value="dollars">Dollars</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TradeParametersComponent;
