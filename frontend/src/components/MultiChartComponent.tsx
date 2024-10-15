// MultiChartComponent.tsx
import React, { useState } from 'react';
import ChartComponent from './ChartComponent';
import './MultiChartComponent.css';

interface ChartConfig {
    id: number;
    stockSymbol: string;
}

const MultiChartComponent: React.FC = () => {
    // State to manage the list of charts with their configurations
    const [charts, setCharts] = useState<ChartConfig[]>([
        { id: 0, stockSymbol: 'AAPL' }, // Default chart with 'AAPL'
    ]);

    const [newStockSymbol, setNewStockSymbol] = useState('');

    // Function to add a new chart
    const addChart = (stockSymbol: string) => {
        if (stockSymbol.trim() === '') {
            alert('Please enter a stock symbol');
            return;
        }

        setCharts((prevCharts) => [
            ...prevCharts,
            {
                id: prevCharts.length > 0 ? prevCharts[prevCharts.length - 1].id + 1 : 0,
                stockSymbol: stockSymbol.trim().toUpperCase(),
            },
        ]);
    };

    // Function to handle adding a chart with user input
    const handleAddChart = () => {
        if (newStockSymbol.trim() !== '') {
            addChart(newStockSymbol.trim().toUpperCase());
            setNewStockSymbol('');
        } else {
            alert('Please enter a stock symbol');
        }
    };

    // Function to remove a chart
    const removeChart = (id: number) => {
        if (charts.length <= 1) {
            alert('Cannot remove the last chart');
            return;
        }
        setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== id));
    };

    return (
        <div className="multi-chart-container">
            {/* Add Chart Section */}
            <div className="add-chart-section">
                <input
                    type="text"
                    placeholder="Enter Stock Symbol"
                    value={newStockSymbol}
                    onChange={(e) => setNewStockSymbol(e.target.value.toUpperCase())}
                />
                <button onClick={handleAddChart}>Add Chart</button>
            </div>

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
                            addChart={addChart}
                            removeChart={removeChart}
                        />

                        {/* Remove Chart Button */}
                        {charts.length > 1 && (
                            <button onClick={() => removeChart(chart.id)}>Remove Chart</button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default MultiChartComponent;
