import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    createChart,
    CrosshairMode,
    IChartApi,
    ISeriesApi,
    CandlestickData,
    Time,
} from 'lightweight-charts';
import { parseISO, format, subDays } from 'date-fns';
import './ChartComponent.css';

// Define the props for the ChartComponent
interface ChartComponentProps {
    chartId: number;
    stockSymbol: string;
    addChart: (stockSymbol: string) => void;
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

interface LineData {
    time: Time;
    value: number;
}

const ChartComponent: React.FC<ChartComponentProps> = ({
    chartId,
    stockSymbol,
    addChart,
    removeChart,
}) => {
    // State variables
    const [rawData, setRawData] = useState<StockDataItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showMacd, setShowMacd] = useState(false);
    const [showRsi, setShowRsi] = useState(false);
    const [showSma, setShowSma] = useState(false);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartApiRef = useRef<IChartApi | null>(null);
    const mainSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

    // Indicator chart refs
    const macdChartContainerRef = useRef<HTMLDivElement>(null);
    const rsiChartContainerRef = useRef<HTMLDivElement>(null);
    const smaChartContainerRef = useRef<HTMLDivElement>(null);
    const macdChartRef = useRef<IChartApi | null>(null);
    const rsiChartRef = useRef<IChartApi | null>(null);
    const smaChartRef = useRef<IChartApi | null>(null);
    const macdSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

    // State for stock symbol input and current stock symbol
    const [stockSymbolInput, setStockSymbolInput] = useState<string>(stockSymbol);
    const [currentStockSymbol, setCurrentStockSymbol] = useState<string>(stockSymbol);

    // State for selected time frame
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<number | 'all'>(30);

    // Time frames
    const timeFrames = [
        { label: '1 Week', value: 7 },
        { label: '2 Weeks', value: 14 },
        { label: '30 Days', value: 30 },
        { label: '60 Days', value: 60 },
        { label: '90 Days', value: 90 },
        { label: '1 Year', value: 365 },
        { label: '2 Years', value: 730 },
        { label: '5 Years', value: 1825 },
        { label: 'All Time', value: 'all' as const },
    ];

    // Fetch stock data when the stock symbol or time frame changes
    useEffect(() => {
        if (currentStockSymbol) {
            setLoading(true);
            const params: Record<string, string> = {};

            let fromDate: Date | undefined;
            const toDate = new Date();

            if (selectedTimeFrame !== 'all') {
                fromDate = subDays(toDate, selectedTimeFrame);
                params.from = fromDate.toISOString().split('T')[0];
            }

            params.to = toDate.toISOString().split('T')[0];

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
    }, [currentStockSymbol, selectedTimeFrame]);

    // Initialize the chart
    useEffect(() => {
        if (chartContainerRef.current && !chartApiRef.current) {
            const chart = createChart(chartContainerRef.current, {
                width: chartContainerRef.current.clientWidth,
                height: chartContainerRef.current.clientHeight || 500,
                layout: {
                    background: '#FFFFFF', // Changed to 'background'
                    textColor: '#000',
                },
                grid: {
                    vertLines: {
                        color: '#e0e0e0',
                    },
                    horzLines: {
                        color: '#e0e0e0',
                    },
                },
                crosshair: {
                    mode: CrosshairMode.Normal,
                },
                timeScale: {
                    borderColor: '#D1D4DC',
                },
                rightPriceScale: {
                    borderColor: '#D1D4DC',
                },
            });

            chartApiRef.current = chart;

            // Add the main candlestick series
            const mainSeries = chart.addCandlestickSeries();
            mainSeriesRef.current = mainSeries;
        }

        // Initialize MACD chart
        if (showMacd && !macdChartRef.current && macdChartContainerRef.current) {
            const macdChart = createChart(macdChartContainerRef.current, {
                width: macdChartContainerRef.current.clientWidth,
                height: 100,
                layout: { background: '#FFFFFF', textColor: '#000' }, // Changed to 'background'
                rightPriceScale: { borderColor: '#D1D4DC' },
                crosshair: { mode: CrosshairMode.Normal },
                timeScale: { visible: false },
            });
            macdChartRef.current = macdChart;
            macdSeriesRef.current = macdChart.addLineSeries({
                color: 'red',
                lineWidth: 2,
            });
        }

        // Initialize RSI chart
        if (showRsi && !rsiChartRef.current && rsiChartContainerRef.current) {
            const rsiChart = createChart(rsiChartContainerRef.current, {
                width: rsiChartContainerRef.current.clientWidth,
                height: 100,
                layout: { background: '#FFFFFF', textColor: '#000' }, // Changed to 'background'
                rightPriceScale: { borderColor: '#D1D4DC' },
                crosshair: { mode: CrosshairMode.Normal },
                timeScale: { visible: false },
            });
            rsiChartRef.current = rsiChart;
            rsiSeriesRef.current = rsiChart.addLineSeries({
                color: 'green',
                lineWidth: 2,
            });
        }

        // Initialize SMA chart (optional)
        if (showSma && !smaChartRef.current && smaChartContainerRef.current) {
            const smaChart = createChart(smaChartContainerRef.current, {
                width: smaChartContainerRef.current.clientWidth,
                height: 100,
                layout: { background: '#FFFFFF', textColor: '#000' }, // Changed to 'background'
                rightPriceScale: { borderColor: '#D1D4DC' },
                crosshair: { mode: CrosshairMode.Normal },
                timeScale: { visible: false },
            });
            smaChartRef.current = smaChart;
            smaSeriesRef.current = smaChart.addLineSeries({
                color: 'blue',
                lineWidth: 2,
            });
        }

        // Cleanup on unmount
        return () => {
            if (chartApiRef.current) {
                chartApiRef.current.remove();
                chartApiRef.current = null;
            }
            if (macdChartRef.current) {
                macdChartRef.current.remove();
                macdChartRef.current = null;
            }
            if (rsiChartRef.current) {
                rsiChartRef.current.remove();
                rsiChartRef.current = null;
            }
            if (smaChartRef.current) {
                smaChartRef.current.remove();
                smaChartRef.current = null;
            }
        };
    }, [showMacd, showRsi, showSma]);

    // Update chart data when rawData changes
    useEffect(() => {
        if (!rawData || rawData.length === 0) return;

        const sortedData = [...rawData].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Prepare candlestick data
        const candlestickData: CandlestickData[] = sortedData.map((item) => ({
            time: format(parseISO(item.date), 'yyyy-MM-dd') as Time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
        }));
        mainSeriesRef.current?.setData(candlestickData);

        // Set data for MACD chart
        if (showMacd && macdSeriesRef.current) {
            const macdData: LineData[] = sortedData
                .filter((item) => item.macd !== undefined && item.macd !== null && !isNaN(item.macd))
                .map((item) => ({
                    time: format(parseISO(item.date), 'yyyy-MM-dd') as Time,
                    value: item.macd as number,
                }));
            if (macdData.length > 0) {
                macdSeriesRef.current.setData(macdData);
            } else {
                console.warn('No valid MACD data available.');
            }
        }

        // Set data for RSI chart
        if (showRsi && rsiSeriesRef.current) {
            const rsiData: LineData[] = sortedData
                .filter((item) => item.rsi !== undefined && item.rsi !== null && !isNaN(item.rsi))
                .map((item) => ({
                    time: format(parseISO(item.date), 'yyyy-MM-dd') as Time,
                    value: item.rsi as number,
                }));
            if (rsiData.length > 0) {
                rsiSeriesRef.current.setData(rsiData);
            } else {
                console.warn('No valid RSI data available.');
            }
        }

        // Set data for SMA chart
        if (showSma && smaSeriesRef.current) {
            const smaData: LineData[] = sortedData
                .filter((item) => item.sma !== undefined && item.sma !== null && !isNaN(item.sma))
                .map((item) => ({
                    time: format(parseISO(item.date), 'yyyy-MM-dd') as Time,
                    value: item.sma as number,
                }));
            if (smaData.length > 0) {
                smaSeriesRef.current.setData(smaData);
            } else {
                console.warn('No valid SMA data available.');
            }
        }

        // Adjust time scale to fit content
        chartApiRef.current?.timeScale().fitContent();
        macdChartRef.current?.timeScale().fitContent();
        rsiChartRef.current?.timeScale().fitContent();
        smaChartRef.current?.timeScale().fitContent();
    }, [rawData, showMacd, showRsi, showSma]);

    // Update chart size on window resize
    useEffect(() => {
        const handleResize = () => {
            if (chartContainerRef.current && chartApiRef.current) {
                chartApiRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
            if (macdChartContainerRef.current && macdChartRef.current) {
                macdChartRef.current.applyOptions({
                    width: macdChartContainerRef.current.clientWidth,
                });
            }
            if (rsiChartContainerRef.current && rsiChartRef.current) {
                rsiChartRef.current.applyOptions({
                    width: rsiChartContainerRef.current.clientWidth,
                });
            }
            if (smaChartContainerRef.current && smaChartRef.current) {
                smaChartRef.current.applyOptions({
                    width: smaChartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle the submission of the stock symbol form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentStockSymbol(stockSymbolInput);
        setRawData([]); // Reset data when symbol changes
    };

    return (
        <div className="chart-component">
            {/* Main Chart Container */}
            <div className="chart-container" style={{ position: 'relative' }}>
                <div
                    ref={chartContainerRef}
                    className="tv-chart"
                    style={{ width: '100%', height: '100%' }}
                />
                {/* Loading Overlay */}
                {loading && (
                    <div className="chart-loading-overlay">
                        Loading chart...
                    </div>
                )}
            </div>

            {/* MACD Chart */}
            {showMacd && (
                <div className="indicator-chart-container" style={{ position: 'relative' }}>
                    <div
                        ref={macdChartContainerRef}
                        className="tv-chart"
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            )}

            {/* RSI Chart */}
            {showRsi && (
                <div className="indicator-chart-container" style={{ position: 'relative' }}>
                    <div
                        ref={rsiChartContainerRef}
                        className="tv-chart"
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            )}

            {/* SMA Chart */}
            {showSma && (
                <div className="indicator-chart-container" style={{ position: 'relative' }}>
                    <div
                        ref={smaChartContainerRef}
                        className="tv-chart"
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            )}

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
                    <button type="submit">Submit</button>
                </form>

                {/* Time Frame Selection */}
                <div className="time-frame-buttons">
                    {timeFrames.map((frame) => (
                        <button
                            key={frame.label}
                            onClick={() => setSelectedTimeFrame(frame.value)}
                            className={selectedTimeFrame === frame.value ? 'active' : ''}
                        >
                            {frame.label}
                        </button>
                    ))}
                </div>

                {/* Add and Remove Chart Buttons */}
                <div className="chart-buttons">
                    <button onClick={() => addChart(currentStockSymbol)}>
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
        </div>
    );
};

export default ChartComponent;