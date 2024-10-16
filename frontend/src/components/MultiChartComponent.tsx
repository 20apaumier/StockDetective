import React, { useState } from 'react';
import ChartComponent from './ChartComponent';
import './MultiChartComponent.css';

// interface for chart configuration
interface ChartConfig {
    id: number;
    stockSymbol: string;
}

const MultiChartComponent: React.FC = () => {
    // State to store all chart configurations
    const [charts, setCharts] = useState<ChartConfig[]>([
        { id: 0, stockSymbol: 'AAPL' }, // Default chart with Apple
    ]);

    // state to handle the input for adding new charts
    const [newStockSymbol, setNewStockSymbol] = useState('');

    // Function to add a new chart to the list
    const addChart = (stockSymbol: string) => {
        // prevent adding an empty or invalid stock symbol
        if (stockSymbol.trim() === '') {
            alert('Please enter a valid stock symbol');
            return;
        }

        // update the chart list with a new chart config
        setCharts((prevCharts) => [
            ...prevCharts,
            {
                // generate a new ID and make stockSymbol uppercase
                id: prevCharts.length > 0 ? prevCharts[prevCharts.length - 1].id + 1 : 0,
                stockSymbol: stockSymbol.trim().toUpperCase(),
            },
        ]);
    };

    // Function to handle adding a chart with user input
    const handleAddChart = () => {
        if (newStockSymbol.trim() !== '') {
            addChart(newStockSymbol.trim().toUpperCase());
            setNewStockSymbol(''); // reset input field
        } else {
            alert('Please enter a stock symbol');
        }
    };

    // Function to remove a chart
    const removeChart = (id: number) => {
        // prevent removal if last chart
        if (charts.length <= 1) {
            alert('Cannot remove the last chart');
            return;
        }
        // remove the chart with the matching id
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

            {/* Display message to refresh if no charts are available */}
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
