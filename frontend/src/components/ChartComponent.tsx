import React, { useEffect, useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import './ChartComponent.css';
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
    startDate?: Date;
    endDate?: Date;
}

const ChartComponent: React.FC<ChartComponentProps> = ({
    stockSymbol,
    startDate,
    endDate,
}) => {
    const [rawData, setRawData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // State variables for technical indicators
    const [showMacd, setShowMacd] = useState(false);
    const [showRsi, setShowRsi] = useState(false);
    const [showSma, setShowSma] = useState(false);

    useEffect(() => {
        if (stockSymbol) {
            setLoading(true);
            const params: any = {};
            if (startDate) params.from = startDate.toISOString().split('T')[0];
            if (endDate) params.to = endDate.toISOString().split('T')[0];

            axios
                .get(`https://localhost:7086/Stock/${stockSymbol}`, { params })
                .then((response) => {
                    setRawData(response.data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    alert(
                        `Failed to fetch data for symbol '${stockSymbol}'. Please try again.`
                    );
                    setLoading(false);
                });
        }
    }, [stockSymbol, startDate, endDate]);

    // Compute chart data based on rawData and indicator toggles
    const chartData = useMemo(() => {
        if (!rawData || rawData.length === 0) return null;
        const reversedData = rawData.slice().reverse();

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
                yAxisID: 'y',
            },
        ];

        if (showMacd) {
            const macdData = reversedData.map((item) => item.macd ?? null);
            datasets.push({
                label: 'MACD',
                data: macdData,
                borderColor: 'red',
                fill: false,
                yAxisID: 'y-axis-macd',
            });
        }

        if (showRsi) {
            const rsiData = reversedData.map((item) => item.rsi ?? null);
            datasets.push({
                label: 'RSI',
                data: rsiData,
                borderColor: 'green',
                fill: false,
                yAxisID: 'y-axis-rsi',
            });
        }

        if (showSma) {
            const smaData = reversedData.map((item) => item.sma ?? null);
            datasets.push({
                label: 'SMA',
                data: smaData,
                borderColor: 'purple',
                fill: false,
                yAxisID: 'y',
            });
        }

        return { labels, datasets };
    }, [rawData, showMacd, showRsi, showSma, stockSymbol]);

    // Chart options with multiple y-axes
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Date',
                    font: {
                        size: 16,
                    },
                },
                ticks: {
                    font: {
                        size: 14,
                    },
                },
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Price (USD)',
                    font: {
                        size: 16,
                    },
                },
                ticks: {
                    font: {
                        size: 14,
                    },
                },
            },
            'y-axis-macd': {
                type: 'linear',
                display: showMacd,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
                title: {
                    display: true,
                    text: 'MACD',
                    font: {
                        size: 16,
                    },
                },
                ticks: {
                    font: {
                        size: 14,
                    },
                },
            },
            'y-axis-rsi': {
                type: 'linear',
                display: showRsi,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
                title: {
                    display: true,
                    text: 'RSI',
                    font: {
                        size: 16,
                    },
                },
                ticks: {
                    font: {
                        size: 14,
                    },
                },
                min: 0,
                max: 100,
            },
        },
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 14,
                    },
                },
            },
            title: {
                display: true,
                text: `${stockSymbol.toUpperCase()} Stock Chart`,
                font: {
                    size: 24,
                },
            },
        },
    };

    if (loading) {
        return (
            <div className="chart-loading">
                <div>Loading chart...</div>
            </div>
        );
    }

    return chartData ? (
        <div className="chart-wrapper">
            {/* Checkboxes to toggle indicators */}
            <div className="checkbox-container">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={showMacd}
                        onChange={(e) => setShowMacd(e.target.checked)}
                    />
                    <span>MACD</span>
                </label>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={showRsi}
                        onChange={(e) => setShowRsi(e.target.checked)}
                    />
                    <span>RSI</span>
                </label>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={showSma}
                        onChange={(e) => setShowSma(e.target.checked)}
                    />
                    <span>Moving Average</span>
                </label>
            </div>
            <div className="chart-container">
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    ) : (
        <div className="chart-loading">
            <div>Please select a stock to view the chart.</div>
        </div>
    );
};

export default ChartComponent;