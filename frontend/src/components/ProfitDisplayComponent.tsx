import React, { useState } from 'react';
import { LineData } from '../types';
import { formatDate } from '../utils';

// interface for trade parameters specific to each indicator
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
    // indicator data for each indicator type
    indicatorData: {
        [indicator: string]: LineData[];
    };
    // trade parameters for each indicator
    tradeParameters: TradeParameters;
    // raw stock data w price/vol information
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
    // state for calculated profit
    const [totalProfit, setTotalProfit] = useState(0);

    const calculateProfit = () => {
        console.log('calculateProfit called');
        console.log('Current tradeParameters:', tradeParameters);

        // set starting cash and shares
        let cash = 10000;
        let shares = 0;

        // Merge stock data with indicator values
        const mergedData = rawData.map((item) => {
            // format date to match indicator data
            const date = formatDate(item.date);
            const indicatorsValues: { [key: string]: number | null } = {};

            // attach indicator values to the stock data if available
            Object.keys(tradeParameters).forEach((indicator) => {
                const indicatorValues = indicatorData[indicator];
                const indValue = indicatorValues?.find((indItem) => indItem.time === date)?.value;
                indicatorsValues[indicator] = indValue !== undefined ? indValue : null;
            });

            return {
                date: item.date,
                close: item.close, // closing price of the stock
                indicatorsValues, // mapped indicator value for this date
            };
        });

        console.log('Merged Data:', mergedData);

        // Simulate trading based on trade parameters and stock data
        for (const dataPoint of mergedData) {
            const { close, indicatorsValues } = dataPoint;

            Object.keys(tradeParameters).forEach((indicator) => {
                const params = tradeParameters[indicator];
                const indicatorValue = indicatorsValues[indicator];

                if (indicatorValue === null || isNaN(indicatorValue)) return;

                // check if buy conditions are met
                let buyConditionMet = false;
                if (params.buyCondition === '<') {
                    buyConditionMet = indicatorValue < params.buyThreshold;
                } else if (params.buyCondition === '>') {
                    buyConditionMet = indicatorValue > params.buyThreshold;
                }

                if (buyConditionMet && cash > 0 && params.tradeAmount > 0) {
                    let amountToBuy = params.tradeAmount;
                    if (params.tradeAmountType === 'dollars') {
                        amountToBuy = params.tradeAmount / close; // convert dollars to shares (closeing value)
                    }
                    // Ensure valid trade amount
                    if (isNaN(amountToBuy) || !isFinite(amountToBuy)) return;

                    // buy shares if we have enough cash
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

                // check if sell conditions are met
                let sellConditionMet = false;
                if (params.sellCondition === '<') {
                    sellConditionMet = indicatorValue < params.sellThreshold;
                } else if (params.sellCondition === '>') {
                    sellConditionMet = indicatorValue > params.sellThreshold;
                }

                if (sellConditionMet && shares > 0 && params.tradeAmount > 0) {
                    let amountToSell = params.tradeAmount;
                    if (params.tradeAmountType === 'dollars') {
                        amountToSell = params.tradeAmount / close; // dollars -> shares
                    }

                    // Ensure valid trade amount
                    if (isNaN(amountToSell) || !isFinite(amountToSell)) return;

                    // sell shares if enough shares are held
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

        // Calculate total profit (cash + remaining shares)
        // TODO: refine profit so we can start at 10000 and not 0
        const totalValue = cash + shares * (rawData[rawData.length - 1]?.close || 0);
        const profit = totalValue - 10000;
        console.log('Total Value:', totalValue);
        console.log('Calculated Profit:', profit);
        setTotalProfit(profit);
    };

    return (
        <div className="profit-display">
            {/* Button to trigger profit calculation */}
            <button onClick={calculateProfit}>Calculate Profit</button>

            {/* Display total profit */}
            <h3>Total Profit: ${totalProfit.toFixed(2)}</h3>
        </div>
    );
};

export default ProfitDisplayComponent;
