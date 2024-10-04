import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import './ChartComponent.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    TimeScale,
    BarElement,
    LineElement,
    PointElement,
    ChartOptions,
    Tooltip,
    Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import {
    CandlestickController,
    CandlestickElement,
} from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

// Register chart components and plugins
ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    BarElement,
    LineElement,
    PointElement,
    CandlestickController,
    CandlestickElement,
    Tooltip,
    Legend
);

// Define the props for the ChartComponent
interface ChartComponentProps {
    chartId: number;
    stockSymbol: string;
    startDate?: Date;
    endDate?: Date;
    addChart: (stockSymbol: string, startDate?: Date, endDate?: Date) => void;
    removeChart: (id: number) => void;
}

// Define the shape of the stock data
interface StockDataItem {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    macd?: number;
    macdSignal?: number;
    macdHistogram?: number;
    rsi?: number;
    sma?: number;
}

const ChartComponent: React.FC<ChartComponentProps> = ({
    chartId,
    stockSymbol,
    startDate,
    endDate,
    addChart,
    removeChart,
}) => {
    // State to store fetched stock data
    const [rawData, setRawData] = useState<StockDataItem[]>([]);
    const [loading, setLoading] = useState(false);

    // State variables for toggling technical indicators
    const [showMacd, setShowMacd] = useState(false);
    const [showRsi, setShowRsi] = useState(false);
    const [showSma, setShowSma] = useState(false);

    // State for drawing tools
    const [drawingColor, setDrawingColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(2);
    const [isErasing, setIsErasing] = useState(false);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const sketchCanvasRef = useRef<ReactSketchCanvasRef>(null);

    // Reference to the chart instance
    const chartRef = useRef<ChartJS>(null);

    // State for stock symbol input and current stock symbol
    const [stockSymbolInput, setStockSymbolInput] = useState<string>(stockSymbol);
    const [currentStockSymbol, setCurrentStockSymbol] = useState<string>(stockSymbol);

    // State for date inputs and current date range
    const [startDateInput, setStartDateInput] = useState<string>(
        startDate ? startDate.toISOString().split('T')[0] : ''
    );
    const [endDateInput, setEndDateInput] = useState<string>(
        endDate ? endDate.toISOString().split('T')[0] : ''
    );
    const [currentStartDate, setCurrentStartDate] = useState<Date | undefined>(startDate);
    const [currentEndDate, setCurrentEndDate] = useState<Date | undefined>(endDate);

    // State to toggle between line chart and candlestick chart
    const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');

    // Fetch stock data when the stock symbol or date range changes
    useEffect(() => {
        if (currentStockSymbol) {
            setLoading(true);
            const params: Record<string, string> = {};

            if (currentStartDate) params.from = currentStartDate.toISOString().split('T')[0];
            if (currentEndDate) params.to = currentEndDate.toISOString().split('T')[0];

            axios
                .get(`http://localhost:7086/Stock/${currentStockSymbol}`, { params })
                .then((response) => {
                    setRawData(response.data as StockDataItem[]);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    alert(
                        `Failed to fetch data for symbol '${currentStockSymbol}'. Please try again.`
                    );
                    setLoading(false);
                });
        }
    }, [currentStockSymbol, currentStartDate, currentEndDate]);

    // Handle the submission of the stock symbol and date range form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentStockSymbol(stockSymbolInput);
        setCurrentStartDate(startDateInput ? new Date(startDateInput) : undefined);
        setCurrentEndDate(endDateInput ? new Date(endDateInput) : undefined);
    };

    // Prepare the chart data based on the chart type and selected indicators
    const chartData = useMemo(() => {
        if (!rawData || rawData.length === 0) return null;

        // Reverse the data to display in chronological order
        //const reversedData = rawData.slice().reverse();
        const datasets = [];

        // Add SMA dataset if selected
        if (showSma) {
            const smaData = rawData.map((item) => ({
                x: parseISO(item.date),
                y: item.sma ?? NaN,
            }));
            datasets.push({
                label: 'SMA',
                data: smaData,
                borderColor: 'blue',
                fill: false,
                yAxisID: 'y',
            });
        }

        // Add MACD dataset if selected
        if (showMacd) {
            const macdData = rawData.map((item) => ({
                x: parseISO(item.date),
                y: item.macd ?? NaN,
            }));
            datasets.push({
                label: 'MACD',
                data: macdData,
                borderColor: 'red',
                fill: false,
                yAxisID: 'y1',
            });
        }

        // Add RSI dataset if selected
        if (showRsi) {
            const rsiData = rawData.map((item) => ({
                x: parseISO(item.date),
                y: item.rsi ?? NaN,
            }));
            datasets.push({
                label: 'RSI',
                data: rsiData,
                borderColor: 'green',
                fill: false,
                yAxisID: 'y1',
            });
        }

        if (chartType === 'line') {
            // Prepare data for the line chart
            const data = rawData.map((item) => ({
                x: parseISO(item.date),
                y: item.close,
            }));

            datasets.push({
                label: `${currentStockSymbol.toUpperCase()} Closing Price`,
                data: data,
                borderColor: 'purple',
                fill: false,
                yAxisID: 'y',
            });

            return { datasets };
        }

        if (chartType === 'candlestick') {
            // Prepare data for the candlestick chart
            const data = rawData.map((item) => ({
                x: parseISO(item.date),
                o: item.open,
                h: item.high,
                l: item.low,
                c: item.close,
            }));

            datasets.push({
                label: `${currentStockSymbol.toUpperCase()} Candlestick`,
                data: data,
                yAxisID: 'y',
                borderColor: '#333',
                borderWidth: 1,
                backgroundColor: 'rgba(0, 0, 0, 0)',
                color: {
                    up: '#26a69a',
                    down: '#ef5350',
                    unchanged: '#999999',
                },
                wickColor: {
                    up: '#26a69a',
                    down: '#ef5350',
                    unchanged: '#999999',
                },
            });

            return { datasets };
        }

        // if neither option (should never happen)
        return null;
    }, [rawData, chartType, showMacd, showRsi, showSma, currentStockSymbol]);

    // Define chart options
    const chartOptions: ChartOptions<'line' | 'candlestick'> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        layout: {
            padding: {
                right: 50,
            },
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day',
                },
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
                    source: 'auto',
                    maxRotation: 0, // To avoid overlapping dates
                    autoSkip: true, // Skip labels to avoid crowding
                },
                offset: true, // Add spacing between the first and last candlestick
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
                    axis.width = 50; // Fix the width to prevent shifting
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
                text: `${currentStockSymbol.toUpperCase()} Stock Chart`,
                font: {
                    size: 24,
                },
            },
            tooltip: {
                enabled: true, // Ensure tooltips are enabled
            },
        },
    };

    // Render loading message if data is still being fetched
    // Else, Render the chart component
    return loading ? (
        <div className="chart-loading">Loading chart...</div>
    ) : chartData ? (
        <div className="chart-component">
            {/* Chart Type Toggle */}
            <div className="chart-type-toggle">
                <button
                    onClick={() => setChartType('line')}
                    disabled={chartType === 'line'}
                >
                    Line Chart
                </button>
                <button
                    onClick={() => setChartType('candlestick')}
                    disabled={chartType === 'candlestick'}
                >
                    Candlestick Chart
                </button>
            </div>

            {/* Chart Container */}
            <div className="chart-container">
                <Chart
                    ref={chartRef}
                    type={chartType}
                    data={chartData}
                    options={chartOptions}
                />
                {/* Drawing Canvas Overlay */}
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
                        pointerEvents: isDrawingMode ? 'auto' : 'none',
                    }}
                    width="100%"
                    height="100%"
                    className="drawing-canvas"
                />
            </div>

            {/* Controls Below the Chart */}
            <div className="chart-controls">
                {/* Stock Selector Form */}
                <form onSubmit={handleSubmit} className="stock-selector-form">
                    <label>
                        Stock Symbol:
                        <input
                            type="text"
                            value={stockSymbolInput}
                            onChange={(e) => setStockSymbolInput(e.target.value.toUpperCase())}
                        />
                    </label>
                    <label>
                        Start Date:
                        <input
                            type="date"
                            value={startDateInput}
                            onChange={(e) => setStartDateInput(e.target.value)}
                        />
                    </label>
                    <label>
                        End Date:
                        <input
                            type="date"
                            value={endDateInput}
                            onChange={(e) => setEndDateInput(e.target.value)}
                        />
                    </label>
                    <button type="submit">Submit</button>
                </form>

                {/* Add and Remove Chart Buttons */}
                <div className="chart-buttons">
                    <button
                        onClick={() =>
                            addChart(currentStockSymbol, currentStartDate, currentEndDate)
                        }
                    >
                        Add Another {currentStockSymbol.toUpperCase()} Chart
                    </button>
                    <button onClick={() => removeChart(chartId)}>Remove Chart</button>
                </div>
            </div>

            {/* Technical Indicators Checkboxes */}
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

            {/* Drawing Controls */}
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

                {/* Show Drawing Tools When Drawing Mode is Enabled */}
                {isDrawingMode && (
                    <>
                        {/* Color Picker */}
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

                        {/* Brush Size Slider */}
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

                        {/* Eraser Toggle */}
                        <div className="eraser-toggle">
                            <button
                                onClick={() => setIsErasing(!isErasing)}
                                className={isErasing ? 'active' : ''}
                            >
                                {isErasing ? 'Switch to Pen' : 'Eraser'}
                            </button>
                        </div>

                        {/* Undo, Redo, and Clear Buttons */}
                        <div className="drawing-buttons">
                            <button onClick={() => sketchCanvasRef.current?.undo()}>Undo</button>
                            <button onClick={() => sketchCanvasRef.current?.redo()}>Redo</button>
                            <button onClick={() => sketchCanvasRef.current?.clearCanvas()}>
                                Clear Drawing
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    ) : (
        <div className="chart-loading">No data available for {currentStockSymbol.toUpperCase()}.</div>
    );
};

export default ChartComponent;
