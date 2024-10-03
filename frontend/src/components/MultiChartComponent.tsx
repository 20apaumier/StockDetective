import React, { useState } from 'react';
import ChartComponent from './ChartComponent';
import './MultiChartComponent.css';

interface MultiChartComponentProps {
    stockSymbol: string;
    startDate?: Date;
    endDate?: Date;
}

const MultiChartComponent: React.FC<MultiChartComponentProps> = ({
    stockSymbol,
    startDate,
    endDate,
}) => {
    // State to manage the list of chart IDs
    const [chartIds, setChartIds] = useState<number[]>([0]); // Start with one chart

    // Function to add a new chart
    const addChart = () => {
        setChartIds((prevChartIds) => [
            ...prevChartIds,
            prevChartIds.length > 0 ? prevChartIds[prevChartIds.length - 1] + 1 : 0,
        ]);
    };

    // Function to remove a chart
    const removeChart = (id: number) => {
        setChartIds((prevChartIds) => prevChartIds.filter((chartId) => chartId !== id));
    };

    return (
        <div className="multi-chart-container">
            <button onClick={addChart}>Add Another Chart</button>
            {chartIds.map((id) => (
                <div key={id} className="chart-wrapper">
                    {/* Pass the necessary props to ChartComponent */}
                    <ChartComponent
                        stockSymbol={stockSymbol}
                        startDate={startDate}
                        endDate={endDate}
                    />
                    {/* Remove Chart Button */}
                    <button onClick={() => removeChart(id)}>Remove Chart</button>
                </div>
            ))}
        </div>
    );
};

export default MultiChartComponent;
