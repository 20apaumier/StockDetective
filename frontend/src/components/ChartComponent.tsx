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
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

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
    chartId: number;
    stockSymbol: string; // stock symbol to fetch data for
    startDate?: Date; // optional filter
    endDate?: Date; // optional filter
    addChart: (stockSymbol: string, startDate?: Date, endDate?: Date) => void;
    removeChart: (id: number) => void;
}

// Define the shape of your stock data
interface StockDataItem {
    date: string;
    close: number;
    macd?: number;
    rsi?: number;
    sma?: number;
    // Add other fields as necessary
}

const ChartComponent: React.FC<ChartComponentProps> = ({
    chartId,
    stockSymbol,
    startDate,
    endDate,
    addChart,
    removeChart,
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
    const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
    const sketchCanvasRef = useRef<ReactSketchCanvasRef>(null);

    const chartRef = useRef<ChartJS<'line', number[], string>>(null);

    // State for stock symbol
    const [stockSymbolInput, setStockSymbolInput] = useState<string>(stockSymbol);
    const [currentStockSymbol, setCurrentStockSymbol] = useState<string>(stockSymbol);

    // State for date inputs
    const [startDateInput, setStartDateInput] = useState<string>(
        startDate ? startDate.toISOString().split('T')[0] : ''
    );
    const [endDateInput, setEndDateInput] = useState<string>(
        endDate ? endDate.toISOString().split('T')[0] : ''
    );

    // State for current date range
    const [currentStartDate, setCurrentStartDate] = useState<Date | undefined>(startDate);
    const [currentEndDate, setCurrentEndDate] = useState<Date | undefined>(endDate);

    // Fetch stock data when stockSymbol, startDate, or endDate changes
    useEffect(() => {
        if (currentStockSymbol) {
            setLoading(true); // start loading
            const params: Record<string, string> = {}; // parameters for api request

            // format start/end date
            if (currentStartDate) params.from = currentStartDate.toISOString().split('T')[0];
            if (currentEndDate) params.to = currentEndDate.toISOString().split('T')[0];

            // fetch stock data from api
            axios
                .get(`http://localhost:7086/Stock/${currentStockSymbol}`, { params })
                .then((response) => {
                    setRawData(response.data as StockDataItem[]); // set raw data from api response
                    setLoading(false); // stop loading
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    alert(
                        `Failed to fetch data for symbol '${currentStockSymbol}'. Please try again.`
                    ); // show error alert if the request fails
                    setLoading(false); // stop loading
                });
        }
    }, [currentStockSymbol, currentStartDate, currentEndDate]); // trigger fetch if these change

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentStockSymbol(stockSymbolInput);
        setCurrentStartDate(startDateInput ? new Date(startDateInput) : undefined);
        setCurrentEndDate(endDateInput ? new Date(endDateInput) : undefined);
    };

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
                label: `${currentStockSymbol.toUpperCase()} Closing Price`,
                data: prices,
                borderColor: 'purple',
                fill: false,
                yAxisID: 'y', // Use primary y-axis
            },
        ];

        // Add SMA if showSma
        if (showSma) {
            const smaData = reversedData.map((item) => item.sma ?? NaN);
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
            const macdData = reversedData.map((item) => item.macd ?? NaN);
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
            const rsiData = reversedData.map((item) => item.rsi ?? NaN);
            datasets.push({
                label: 'RSI',
                data: rsiData,
                borderColor: 'green',
                fill: false,
                yAxisID: 'y1', // Use secondary y-axis
            });
        }

        return { labels, datasets }; // chart data
    }, [rawData, showMacd, showRsi, showSma, currentStockSymbol]);

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
        <div className="chart-component">

            {/* Controls above the chart */}

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

            {/* Technical Indicators */}
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

            {/* Controls below the chart */}
            <div className="chart-controls">
                {/* Stock Selector */}
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

                {/* Buttons */}
                <div className="chart-buttons">
                    {/* Add Another Chart Button */}
                    <button
                        onClick={() =>
                            addChart(currentStockSymbol, currentStartDate, currentEndDate)
                        }
                    >
                        Add Another {currentStockSymbol.toUpperCase()} Chart
                    </button>

                    {/* Remove Chart Button */}
                    <button onClick={() => removeChart(chartId)}>Remove Chart</button>
                </div>
            </div>
            
        </div>
    ) : (
        <div className="chart-loading">
            <div>No data available for {currentStockSymbol.toUpperCase()}.</div>
        </div>
    );
};

export default ChartComponent;
