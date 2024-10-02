import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import './ChartComponent.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ReactSketchCanvas } from 'react-sketch-canvas';

// Register chart components for ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ChartTitle,
    Tooltip,
    Legend
);

// Define props for the ChartComponent
interface ChartComponentProps {
    stockSymbol: string; // stock symbol to fetch data for
    startDate?: Date; // optional filter
    endDate?: Date; // optional filter
}

interface StockDataItem {
    date: string;
    close: number;
    macd?: number;
    rsi?: number;
    sma?: number;
    // Add other fields as necessary
}

const ChartComponent: React.FC<ChartComponentProps> = ({
    stockSymbol,
    startDate,
    endDate,
}) => {
    const [rawData, setRawData] = useState<StockDataItem[]>([]); // state to store fetched stock data
    const [loading, setLoading] = useState(false); // toggle loading state

    // State variables for toggling technical indicators
    const [showMacd, setShowMacd] = useState(false);
    const [showRsi, setShowRsi] = useState(false);
    const [showSma, setShowSma] = useState(false);

    // State for drawing color, brush size, eraser mode, and canvas reference
    const [drawingColor, setDrawingColor] = useState<string>('#000000'); // Default to black
    const [brushSize, setBrushSize] = useState<number>(2);
    const [isErasing, setIsErasing] = useState<boolean>(false);
    const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false); // New state variable
    const sketchCanvasRef = useRef<ReactSketchCanvas | null>(null);

    const chartRef = useRef<ChartJS<'line', number[], string>>(null);

    // Fetch stock data when stockSymbol, startDate, or endDate changes
    useEffect(() => {
        if (stockSymbol) {
            setLoading(true); // start loading
            const params: Record<string, string> = {}; // parameters for api request

            // format start/end date
            if (startDate) params.from = startDate.toISOString().split('T')[0];
            if (endDate) params.to = endDate.toISOString().split('T')[0];

            // fetch stock data from api
            axios
                .get(`http://localhost:7086/Stock/${stockSymbol}`, { params })
                .then((response) => {
                    setRawData(response.data as StockDataItem[]); // set raw data from api response
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

    // Memoized calculation for chart data based on rawData and selected indicators
    const chartData = useMemo(() => {
        // return null if no data
        if (!rawData || rawData.length === 0) return null;

        // reverse data to show in proper chronological order
        const reversedData = rawData.slice().reverse();

        // extract dates and closing prices from raw data for line graph
        const labels = reversedData.map((item) =>
            format(parseISO(item.date), 'MMM dd, yyyy')
        );
        const prices = reversedData.map((item) => item.close);

        // datasets for the chart
        const datasets = [
            {
                label: `${stockSymbol.toUpperCase()} Closing Price`,
                data: prices,
                borderColor: 'purple',
                fill: false,
                yAxisID: 'y', // Use primary y-axis
            },
        ];

        // Add SMA if showSma
        if (showSma) {
            const smaData = reversedData.map((item) => item.sma ?? null);
            datasets.push({
                label: 'SMA',
                data: smaData,
                borderColor: 'blue',
                fill: false,
                yAxisID: 'y', // Use primary y-axis
            });
        }

        // Add MACD dataset if showMacd
        if (showMacd) {
            const macdData = reversedData.map((item) => item.macd ?? null);
            datasets.push({
                label: 'MACD',
                data: macdData,
                borderColor: 'red',
                fill: false,
                yAxisID: 'y1', // Use secondary y-axis
            });
        }

        // Add RSI dataset if showRsi
        if (showRsi) {
            const rsiData = reversedData.map((item) => item.rsi ?? null);
            datasets.push({
                label: 'RSI',
                data: rsiData,
                borderColor: 'green',
                fill: false,
                yAxisID: 'y1', // Use secondary y-axis
            });
        }

        return { labels, datasets }; // chart data
    }, [rawData, showMacd, showRsi, showSma, stockSymbol]); // recompute on relevant state changes

    // Chart options
    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        layout: {
            padding: {
                right: 50, // Reserve space for secondary y-axis
            },
        },
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
                type: 'linear' as const,
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
            y1: {
                type: 'linear' as const,
                display: showMacd || showRsi, // Display only if MACD or RSI is shown
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    font: {
                        size: 14,
                    },
                },
                afterFit: (axis) => {
                    axis.width = 50;
                },
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
            tooltip: {
                enabled: true,
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
            {/* Controls */}
            <div className="controls-container">
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

                {/* Drawing controls */}
                <div className="drawing-controls">
                    {/* Toggle Drawing Mode */}
                    <div className="drawing-mode-toggle">
                        <button
                            onClick={() => setIsDrawingMode(!isDrawingMode)}
                            className={isDrawingMode ? 'active' : ''}
                        >
                            {isDrawingMode ? 'Disable Drawing' : 'Enable Drawing'}
                        </button>
                    </div>

                    {/* Only show drawing tools when in drawing mode */}
                    {isDrawingMode && (
                        <>
                            {/* Color picker for drawing */}
                            <div className="color-picker">
                                <label>
                                    Drawing Color:
                                    <input
                                        type="color"
                                        value={drawingColor}
                                        onChange={(e) => {
                                            setDrawingColor(e.target.value);
                                            if (isErasing) setIsErasing(false); // Switch to pen mode
                                        }}
                                    />
                                </label>
                            </div>

                            {/* Brush size slider */}
                            <div className="brush-size-slider">
                                <label>
                                    Brush Size:
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        value={brushSize}
                                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                    />
                                </label>
                            </div>

                            {/* Eraser toggle */}
                            <div className="eraser-toggle">
                                <button
                                    onClick={() => setIsErasing(!isErasing)}
                                    className={isErasing ? 'active' : ''}
                                >
                                    {isErasing ? 'Switch to Pen' : 'Eraser'}
                                </button>
                            </div>

                            {/* Clear and Undo/Redo buttons */}
                            <div className="drawing-buttons">
                                <button onClick={() => sketchCanvasRef.current?.undo()}>
                                    Undo
                                </button>
                                <button onClick={() => sketchCanvasRef.current?.redo()}>
                                    Redo
                                </button>
                                <button onClick={() => sketchCanvasRef.current?.clearCanvas()}>
                                    Clear Drawing
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="chart-container">
                <Line ref={chartRef} data={chartData} options={chartOptions} />
                <ReactSketchCanvas
                    ref={sketchCanvasRef}
                    strokeWidth={brushSize}
                    strokeColor={isErasing ? '#FFFFFF' : drawingColor}
                    eraserWidth={brushSize}
                    canvasColor="transparent"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: isDrawingMode ? 'auto' : 'none', // Toggle pointer events
                    }}
                    width="100%"
                    height="100%"
                    className="drawing-canvas"
                />
            </div>
        </div>
    ) : (
        <div className="chart-loading">
            <div>Please select a stock to view the chart.</div>
        </div>
    );
};

export default ChartComponent;