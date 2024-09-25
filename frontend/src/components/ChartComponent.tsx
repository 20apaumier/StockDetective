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

// register chart components for ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Define props for the ChartComponent
interface ChartComponentProps {
    stockSymbol: string; // stock symbol to fetch data for
    startDate?: Date; // optional filter
    endDate?: Date; // optional filter
}

const ChartComponent: React.FC<ChartComponentProps> = ({
    stockSymbol,
    startDate,
    endDate,
}) => {
    const [rawData, setRawData] = useState<any[]>([]); // state to store fetched stock
    const [loading, setLoading] = useState(false); // toggle loading state

    // State variables for toggling technical indicators
    const [showMacd, setShowMacd] = useState(false);
    const [showRsi, setShowRsi] = useState(false);
    const [showSma, setShowSma] = useState(false);

    // fetch stock data when stockSymbol, startDate, or endDate changes
    useEffect(() => {
        if (stockSymbol) {
            setLoading(true); // start loading
            const params: any = {}; // parameters for api request

            // format start/end date
            if (startDate) params.from = startDate.toISOString().split('T')[0];
            if (endDate) params.to = endDate.toISOString().split('T')[0];

            // fetch stock data from api
            axios
                .get(`https://localhost:7086/Stock/${stockSymbol}`, { params })
                .then((response) => {
                    setRawData(response.data); // set raw data from api response
                    setLoading(false); // stop loading
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    alert(
                        `Failed to fetch data for symbol '${stockSymbol}'. Please try again.`
                    ); // show error alert if the request fails
                    setLoading(false); // stop loading
                });
        }
    }, [stockSymbol, startDate, endDate]); // trigger fetch if these change

    // memoized calculation for chart data based on rawData and selected indicators
    const chartData = useMemo(() => {
        // return null if no data
        if (!rawData || rawData.length === 0) return null;

        // reverse data to show in proper chronological order
        // potential fix here to make load faster (get order already in chronological order?)
        const reversedData = rawData.slice().reverse();

        // extract dates and closing prices from raw data for line graph
        // potential to change here for candle option
        const labels = reversedData.map((item) =>
            format(parseISO(item.date), 'MMM dd, yyyy')
        );
        const prices = reversedData.map((item) => item.close);

        // datasets for the chart
        // start with the stock price
        const datasets = [
            {
                label: `${stockSymbol.toUpperCase()} Closing Price`,
                data: prices,
                borderColor: 'purple',
                fill: false,
                yAxisID: 'y',
            },
        ];

        // add MACD dataset if showMacd
        if (showMacd) {
            const macdData = reversedData.map((item) => item.macd ?? null);
            datasets.push({
                label: 'MACD',
                data: macdData,
                borderColor: 'red', // red to be unique
                fill: false,
                yAxisID: 'y-axis-macd',
            });
        }

        // add RSI dataset if showRsi
        if (showRsi) {
            const rsiData = reversedData.map((item) => item.rsi ?? null);
            datasets.push({
                label: 'RSI',
                data: rsiData,
                borderColor: 'green', // greeb to be unique
                fill: false,
                yAxisID: 'y-axis-rsi',
            });
        }

        // add SMA if showSma
        if (showSma) {
            const smaData = reversedData.map((item) => item.sma ?? null);
            datasets.push({
                label: 'SMA',
                data: smaData,
                borderColor: 'blue', // blue to be unique
                fill: false,
                yAxisID: 'y',
            });
        }

        return { labels, datasets }; // chart data
    }, [rawData, showMacd, showRsi, showSma, stockSymbol]); // recompute on relevant state changes

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // disable for flex sizing
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Date', // x-axis label
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
                position: 'left', // primary y-axis on the left (price)
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
                display: showMacd, // display only if macd
                position: 'right', // on the right
                grid: {
                    drawOnChartArea: false, // disable grid lines on macd axis
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
                display: showRsi, // display only if rsi is toggled
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
                min: 0, // min val for rsi
                max: 100, // max val for rsi
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
            // chart title
            title: {
                display: true,
                text: `${stockSymbol.toUpperCase()} Stock Chart`, 
                font: {
                    size: 24,
                },
            },
        },
    };

    // render the loading message if data is still being fetched
    if (loading) {
        return (
            <div className="chart-loading">
                <div>Loading chart...</div>
            </div>
        );
    }

    // render the chart component
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