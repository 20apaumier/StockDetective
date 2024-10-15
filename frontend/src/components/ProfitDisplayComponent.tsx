import React, { useState } from 'react';
import { LineData } from '../types';
import { formatDate } from '../utils';

interface TradeParameters {
    [indicator: string]: {
        buyThreshold: number;
        buyCondition: '<' | '>';
        sellThreshold: number;
        sellCondition: '<' | '>';
        tradeAmount: number;
        tradeAmountType: 'shares' | 'dollars';
    };
}

interface ProfitDisplayProps {
    indicatorData: {
        [indicator: string]: LineData[];
    };
    tradeParameters: TradeParameters;
    rawData: StockDataItem[];
}

interface StockDataItem {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

const ProfitDisplayComponent: React.FC<ProfitDisplayProps> = ({
    indicatorData,
    tradeParameters,
    rawData,
}) => {
    const [totalProfit, setTotalProfit] = useState(0);

    const calculateProfit = () => {
        console.log('calculateProfit called');
        console.log('Current tradeParameters:', tradeParameters);

        let cash = 10000; // Starting with $10,000
        let shares = 0;

        // Merge stock data with indicator values
        const mergedData = rawData.map((item) => {
            const date = formatDate(item.date);
            const indicatorsValues: { [key: string]: number | null } = {};

            Object.keys(tradeParameters).forEach((indicator) => {
                const indicatorValues = indicatorData[indicator];
                const indValue = indicatorValues?.find((indItem) => indItem.time === date)?.value;
                indicatorsValues[indicator] = indValue !== undefined ? indValue : null;
            });

            return {
                date: item.date,
                close: item.close,
                indicatorsValues,
            };
        });

        console.log('Merged Data:', mergedData);

        // Simulate trading
        for (const dataPoint of mergedData) {
            const { close, indicatorsValues } = dataPoint;

            Object.keys(tradeParameters).forEach((indicator) => {
                const params = tradeParameters[indicator];
                const indicatorValue = indicatorsValues[indicator];

                if (indicatorValue === null || isNaN(indicatorValue)) return;

                // Buy condition
                let buyConditionMet = false;
                if (params.buyCondition === '<') {
                    buyConditionMet = indicatorValue < params.buyThreshold;
                } else if (params.buyCondition === '>') {
                    buyConditionMet = indicatorValue > params.buyThreshold;
                }

                if (buyConditionMet && cash > 0 && params.tradeAmount > 0) {
                    let amountToBuy = params.tradeAmount;
                    if (params.tradeAmountType === 'dollars') {
                        amountToBuy = params.tradeAmount / close;
                    }
                    // Ensure amountToBuy is not NaN or infinite
                    if (isNaN(amountToBuy) || !isFinite(amountToBuy)) return;

                    if (cash >= amountToBuy * close) {
                        shares += amountToBuy;
                        cash -= amountToBuy * close;
                        console.log(
                            `Bought ${amountToBuy.toFixed(2)} shares at $${close.toFixed(
                                2
                            )} on ${dataPoint.date} using ${indicator}`
                        );
                    }
                }

                // Sell condition
                let sellConditionMet = false;
                if (params.sellCondition === '<') {
                    sellConditionMet = indicatorValue < params.sellThreshold;
                } else if (params.sellCondition === '>') {
                    sellConditionMet = indicatorValue > params.sellThreshold;
                }

                if (sellConditionMet && shares > 0 && params.tradeAmount > 0) {
                    let amountToSell = params.tradeAmount;
                    if (params.tradeAmountType === 'dollars') {
                        amountToSell = params.tradeAmount / close;
                    }
                    // Ensure amountToSell is not NaN or infinite
                    if (isNaN(amountToSell) || !isFinite(amountToSell)) return;

                    if (shares >= amountToSell) {
                        shares -= amountToSell;
                        cash += amountToSell * close;
                        console.log(
                            `Sold ${amountToSell.toFixed(2)} shares at $${close.toFixed(
                                2
                            )} on ${dataPoint.date} using ${indicator}`
                        );
                    }
                }
            });
        }

        // Calculate total profit
        const totalValue = cash + shares * (rawData[rawData.length - 1]?.close || 0);
        const profit = totalValue - 10000;
        console.log('Total Value:', totalValue);
        console.log('Calculated Profit:', profit);
        setTotalProfit(profit);
    };

    return (
        <div className="profit-display">
            <button onClick={calculateProfit}>Calculate Profit</button>
            <h3>Total Profit: ${totalProfit.toFixed(2)}</h3>
        </div>
    );
};

export default ProfitDisplayComponent;
