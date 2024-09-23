import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface ChartComponentProps {
    stockSymbol: string;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ stockSymbol }) => {
    const [chartData, setChartData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (stockSymbol) {
            console.log(`Fetching data for stock symbol: ${stockSymbol}`);
            setLoading(true);
            axios
                .get(`https://localhost:7086/Stock/${stockSymbol}`)
                .then((response) => {
                    console.log('Received data from API:', response.data);
                    const data = formatChartData(response.data);
                    setChartData(data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    alert(`Failed to fetch data for symbol '${stockSymbol}'. Please try again.`);
                    setLoading(false);
                });
        }
    }, [stockSymbol]);

    const formatChartData = (stockData: any[]) => {
        try {
            const reversedData = stockData.slice().reverse();

            const labels = reversedData.map((item) =>
                format(parseISO(item.date), 'MMM dd, yyyy')
            );
            const prices = reversedData.map((item) => item.close);

            const datasets = [
                {
                    label: `${stockSymbol.toUpperCase()} Closing Price`,
                    data: prices,
                    borderColor: 'blue',
                    fill: false,
                },
            ];

            return { labels, datasets };
        } catch (error) {
            console.error('Error formatting chart data:', error);
            alert('Error processing chart data. Please try again.');
            return null;
        }
    };

    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Date',
                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Price (USD)',
                },
            },
        },
    };

    if (loading) {
        return <div>Loading chart...</div>;
    }

    console.log('Chart data to be rendered:', chartData);

    return chartData ? (
        <div>
            <Line data={chartData} options={chartOptions} />
        </div>
    ) : (
        <div>Please select a stock to view the chart.</div>
    );
};

export default ChartComponent;