import React, { useState } from 'react';
import ChartComponent from './ChartComponent';
import './MultiChartComponent.css';

interface ChartConfig {
    id: number;
    stockSymbol: string;
    startDate?: Date;
    endDate?: Date;
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

    return (
        <div className="multi-chart-container">
            {charts.length === 0 ? (
                // ... handle no charts case
                <p>no charts, refresh page to load default chart</p>
            ): (
                    charts.map((chart) => (
            <div key={chart.id} className="chart-wrapper">
                {/* Pass the necessary props to ChartComponent */}
                <ChartComponent
                    chartId={chart.id}
                    stockSymbol={chart.stockSymbol}
                    startDate={chart.startDate}
                    endDate={chart.endDate}
                    addChart={addChart}
                    removeChart={removeChart}
                />
            </div>
            ))
      )}
        </div>
    );
};

export default MultiChartComponent;

