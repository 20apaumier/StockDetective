// TradeParametersComponent.tsx
import React, { useState, useEffect } from 'react';

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
    onParametersChange: (params: TradeParameters) => void;
}

const TradeParametersComponent: React.FC<TradeParametersComponentProps> = ({
    onParametersChange,
}) => {
    const indicators = ['MACD', 'RSI', 'SMA']; // Add more indicators as needed

    const [parameters, setParameters] = useState<TradeParameters>({});

    // Initialize parameters
    useEffect(() => {
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
        setParameters(initialParams);
    }, []);

    // Handle input changes
    const handleInputChange = (
        indicator: string,
        field: keyof TradeParameters[string],
        value: string | number
    ) => {
        setParameters((prev) => ({
            ...prev,
            [indicator]: {
                ...prev[indicator],
                [field]: value,
            },
        }));
    };

    // Notify parent component when parameters change
    useEffect(() => {
        if (typeof onParametersChange === 'function') {
            onParametersChange(parameters);
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
                    {indicators.map((indicator) => (
                        <tr key={indicator}>
                            <td>{indicator}</td>
                            <td>
                                <select
                                    value={parameters[indicator]?.buyCondition || '<'}
                                    onChange={(e) =>
                                        handleInputChange(
                                            indicator,
                                            'buyCondition',
                                            e.target.value as '<' | '>'
                                        )
                                    }
                                >
                                    <option value="<">Less Than</option>
                                    <option value=">">Greater Than</option>
                                </select>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={parameters[indicator]?.buyThreshold || ''}
                                    onChange={(e) =>
                                        handleInputChange(
                                            indicator,
                                            'buyThreshold',
                                            parseFloat(e.target.value)
                                        )
                                    }
                                />
                            </td>
                            <td>
                                <select
                                    value={parameters[indicator]?.sellCondition || '>'}
                                    onChange={(e) =>
                                        handleInputChange(
                                            indicator,
                                            'sellCondition',
                                            e.target.value as '<' | '>'
                                        )
                                    }
                                >
                                    <option value="<">Less Than</option>
                                    <option value=">">Greater Than</option>
                                </select>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={parameters[indicator]?.sellThreshold || ''}
                                    onChange={(e) =>
                                        handleInputChange(
                                            indicator,
                                            'sellThreshold',
                                            parseFloat(e.target.value)
                                        )
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={parameters[indicator]?.tradeAmount || ''}
                                    onChange={(e) =>
                                        handleInputChange(
                                            indicator,
                                            'tradeAmount',
                                            parseFloat(e.target.value)
                                        )
                                    }
                                />
                            </td>
                            <td>
                                <select
                                    value={parameters[indicator]?.tradeAmountType || 'shares'}
                                    onChange={(e) =>
                                        handleInputChange(
                                            indicator,
                                            'tradeAmountType',
                                            e.target.value as 'shares' | 'dollars'
                                        )
                                    }
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
