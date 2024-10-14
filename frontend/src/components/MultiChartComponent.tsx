// MultiChartComponent.tsx
import React, { useState } from 'react';
import ChartComponent from './ChartComponent';
import IndicatorComponent from './IndicatorComponent';
import TradeParametersComponent from './TradeParametersComponent';
import NotificationsComponent from './NotificationsComponent';
import ProfitDisplayComponent from './ProfitDisplayComponent';
import './MultiChartComponent.css';
import { LineData } from '../types';

interface ChartConfig {
    id: number;
    stockSymbol: string;
    startDate?: Date;
    endDate?: Date;
    macdData?: LineData[];
    rsiData?: LineData[];
    smaData?: LineData[];
    totalProfit?: number;
}

const MultiChartComponent: React.FC = () => {
    // State to manage the list of charts with their configurations
    const [charts, setCharts] = useState<ChartConfig[]>([
        { id: 0, stockSymbol: 'AAPL' }, // Default chart with 'AAPL'
    ]);

    // Function to add a new chart
    const addChart = (stockSymbol: string) => {
        setCharts((prevCharts) => [
            ...prevCharts,
            {
                id: prevCharts.length > 0 ? prevCharts[prevCharts.length - 1].id + 1 : 0,
                stockSymbol,
            },
        ]);
    };

    // Function to remove a chart
    const removeChart = (id: number) => {
        setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== id));
    };

    // Function to handle updating trading parameters (buy/sell thresholds)
    const updateTradingParameters = (id: number, buyThreshold: number, sellThreshold: number) => {
        setCharts((prevCharts) =>
            prevCharts.map((chart) =>
                chart.id === id
                    ? {
                        ...chart,
                        // Logic for updating trading parameters and calculating profit
                        totalProfit: calculateProfit(buyThreshold, sellThreshold, chart),
                    }
                    : chart
            )
        );
    };

    // Placeholder function to calculate profit
    const calculateProfit = (buyThreshold: number, sellThreshold: number, chart: ChartConfig) => {
        // You can replace this with your logic to calculate profits based on the buy/sell thresholds
        return Math.random() * 1000; // For example, returning a random value for now
    };

    return (
        <div className="multi-chart-container">
            {charts.length === 0 ? (
                <p>No charts available. Refresh the page to load the default chart.</p>
            ) : (
                charts.map((chart) => (
                    <div key={chart.id} className="chart-wrapper">
                        <h2>{chart.stockSymbol.toUpperCase()} Chart</h2>

                        {/* Chart Component */}
                        <ChartComponent
                            chartId={chart.id}
                            stockSymbol={chart.stockSymbol}
                            startDate={chart.startDate}
                            endDate={chart.endDate}
                            addChart={addChart}
                            removeChart={removeChart}
                        />

                        {/* Indicators for this Chart */}
                        <div className="indicator-section">
                            <h3>Indicators</h3>
                            <IndicatorComponent data={chart.macdData || []} type="MACD" />
                            <IndicatorComponent data={chart.rsiData || []} type="RSI" />
                            <IndicatorComponent data={chart.smaData || []} type="SMA" />
                        </div>

                        {/* Trading Parameters for this Chart */}
                        <TradeParametersComponent
                            onUpdate={(buy, sell) => updateTradingParameters(chart.id, buy, sell)}
                        />

                        {/* Add and Remove Chart Buttons */}
                        <div className="chart-buttons">
                            <button onClick={() => addChart(stockSymbol)}>Add Another Chart</button>
                            <button onClick={() => removeChart(chartId)}>Remove Chart</button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default MultiChartComponent;
