// ChartComponent.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    createChart,
    CrosshairMode,
    IChartApi,
    ISeriesApi,
    CandlestickData,
} from 'lightweight-charts';
import { parseISO, format, subDays } from 'date-fns';
import IndicatorComponent from './IndicatorComponent';
import TradeParametersComponent, { TradeParameters } from './TradeParametersComponent';
import NotificationsComponent from './NotificationsComponent';
import ProfitDisplayComponent from './ProfitDisplayComponent';
import { LineData } from '../types';
import './ChartComponent.css';

interface ChartComponentProps {
    chartId: number;
    stockSymbol: string;
    addChart: (stockSymbol: string) => void;
    removeChart: (id: number) => void;
}

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
    stockSymbol,
}) => {
    // state to store raw stock data fetched from the api
    const [rawData, setRawData] = useState<StockDataItem[]>([]);
    const [loading, setLoading] = useState(false);

    // refs for chart and series APIs
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartApiRef = useRef<IChartApi | null>(null);
    const mainSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

    // state to maange the selected time frame for data fetching (default 30)
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<number | 'all'>(30);

    // state to manage visibility of technical indicator charts
    const [showIndicators, setShowIndicators] = useState<{
        macd: boolean;
        rsi: boolean;
        sma: boolean;
    }>({
        macd: false,
        rsi: false,
        sma: false,
    });

    // state to store indicator data
    const [macdData, setMacdData] = useState<LineData[]>([]);
    const [rsiData, setRsiData] = useState<LineData[]>([]);
    const [smaData, setSmaData] = useState<LineData[]>([]);

    // state to store trade parameters received from TradeParametersComponent
    const [tradeParameters, setTradeParameters] = useState<TradeParameters>({});

    // Handle to update trade parameters when changed in TradeParametersComponent
    const handleParametersChange = (params: TradeParameters) => {
        setTradeParameters(params);
    };

    // available time frames for data fetching (good with candles)
    const timeFrames: { label: string; value: number | 'all' }[] = [
        { label: '1 Week', value: 7 },
        { label: '2 Weeks', value: 14 },
        { label: '30 Days', value: 30 },
        { label: '60 Days', value: 60 },
        { label: '90 Days', value: 90 },
        { label: '1 Year', value: 365 },
        { label: '2 Years', value: 730 },
        { label: '5 Years', value: 1825 },
        { label: 'All Time', value: 'all' },
    ];

    // Fetch stock data based on selected time frame or stock symbol changes
    useEffect(() => {
        const fetchStockData = async () => {
            if (stockSymbol) {
                // set loading to true, init new params Record, set toDate to today
                setLoading(true);
                const params: Record<string, string> = {};
                const toDate = new Date();

                // calculate the from date based on the users selected time frame
                // set params to and from
                if (selectedTimeFrame !== 'all') {
                    const fromDate = subDays(toDate, selectedTimeFrame as number);
                    params.from = fromDate.toISOString().split('T')[0];
                }
                params.to = toDate.toISOString().split('T')[0];

                try {
                    // fetch stock data from backend api
                    const response = await axios.get(
                        `http://localhost:7086/Stock/${stockSymbol}`,
                        { params }
                    );
                    console.log('API Response Data:', response.data);

                    // sort data in ascending order
                    const sortedData: StockDataItem[] = response.data.sort(
                        (a: StockDataItem, b: StockDataItem) =>
                            new Date(a.date).getTime() - new Date(b.date).getTime()
                    );
                    setRawData(sortedData);
                    console.log('Raw Data:', sortedData);

                    // Type guard function
                    const isLineData = (item: { time: string; value: number | null }): item is LineData => {
                        return item.value !== null;
                    };

                    // Modified prepareIndicatorData function
                    const prepareIndicatorData = (
                        dataKey: keyof StockDataItem,
                        setter: React.Dispatch<React.SetStateAction<LineData[]>>
                    ) => {
                        const indicatorData = sortedData
                            .map((item) => ({
                                time: format(parseISO(item.date), 'yyyy-MM-dd'),
                                value:
                                    item[dataKey] !== null &&
                                        item[dataKey] !== undefined &&
                                        !isNaN(Number(item[dataKey]))
                                        ? Number(item[dataKey])
                                        : null,
                            }))
                            .filter(isLineData);

                        setter(indicatorData);
                        console.log(`${dataKey} Data:`, indicatorData);
                    };

                    // prepare data for each indicator
                    prepareIndicatorData('macd', setMacdData);
                    prepareIndicatorData('rsi', setRsiData);
                    prepareIndicatorData('sma', setSmaData);
                } catch (error) {
                    console.error('Error fetching stock data:', error);
                    alert(`Failed to fetch data for symbol '${stockSymbol}'`);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchStockData();
    }, [stockSymbol, selectedTimeFrame]);

    // initliaze the chart once the component mounts
    useEffect(() => {
        if (chartContainerRef.current && !chartApiRef.current) {
            const chart = createChart(chartContainerRef.current, {
                width: chartContainerRef.current.clientWidth || 600,
                height: 500,
                layout: { background: { color: '#FFFFFF' }, textColor: '#000' },
                grid: { vertLines: { color: '#e0e0e0' }, horzLines: { color: '#e0e0e0' } },
                crosshair: { mode: CrosshairMode.Normal },
                timeScale: { borderColor: '#D1D4DC', timeVisible: true, secondsVisible: false },
                rightPriceScale: { borderColor: '#D1D4DC' },
            });
            chartApiRef.current = chart;
            mainSeriesRef.current = chart.addCandlestickSeries();
        }

        // Cleanup function to remove the chart when the component unmounts
        return () => {
            chartApiRef.current?.remove();
            chartApiRef.current = null;
        };
    }, []);

    // Effect to update the chart data whenever rawData changes
    useEffect(() => {
        if (chartApiRef.current && mainSeriesRef.current && rawData.length > 0) {
            const candlestickData: CandlestickData[] = rawData.map((item) => ({
                time: format(parseISO(item.date), 'yyyy-MM-dd'),
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
            }));
            console.log('Setting Candlestick Data:', candlestickData);
            mainSeriesRef.current.setData(candlestickData);
            chartApiRef.current.timeScale().fitContent();
        } else {
            console.warn('No candlestick data to set or chart not initialized');
        }
    }, [rawData]);

    // handler to toggle visibility of technical indicators
    const handleIndicatorChange = (indicator: 'macd' | 'rsi' | 'sma', value: boolean) => {
        setShowIndicators((prevState) => ({
            ...prevState,
            [indicator]: value,
        }));
    };

    return (
        <div className="chart-component">
            <div
                className="chart-container"
                ref={chartContainerRef}
                style={{ width: '100%', height: '500px' }}
            ></div>

            {/* If loading, just show Loading... */}
            {loading && <div className="loading-overlay">Loading...</div>}

            {/* Time Frame Selection */}
            <div className="timeframes-section">
                {timeFrames.map((frame) => (
                    <button
                        key={frame.label}
                        className={selectedTimeFrame === frame.value ? 'active' : ''}
                        onClick={() => setSelectedTimeFrame(frame.value)}
                    >
                        {frame.label}
                    </button>
                ))}
            </div>

            {/* Indicator Selection */}
            <div className="indicator-selection">
                <label>
                    <input
                        type="checkbox"
                        checked={showIndicators.macd}
                        onChange={(e) => handleIndicatorChange('macd', e.target.checked)}
                    />
                    MACD
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showIndicators.rsi}
                        onChange={(e) => handleIndicatorChange('rsi', e.target.checked)}
                    />
                    RSI
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showIndicators.sma}
                        onChange={(e) => handleIndicatorChange('sma', e.target.checked)}
                    />
                    SMA
                </label>
            </div>

            {/* Render Technical Indicators if selected */}
            {showIndicators.macd && macdData.length > 0 && (
                <IndicatorComponent data={macdData} type="MACD" />
            )}
            {showIndicators.rsi && rsiData.length > 0 && (
                <IndicatorComponent data={rsiData} type="RSI" />
            )}
            {showIndicators.sma && smaData.length > 0 && (
                <IndicatorComponent data={smaData} type="SMA" />
            )}

            {/* Trade Parameters Component */}
            <TradeParametersComponent onParametersChange={handleParametersChange} />

            {/* Profit Display Component */}
            <ProfitDisplayComponent
                indicatorData={{ MACD: macdData, RSI: rsiData, SMA: smaData }}
                tradeParameters={tradeParameters}
                rawData={rawData}
            />

            {/* Notifications Component */}
            <NotificationsComponent stockSymbol={stockSymbol} />
        </div>
    );
};

export default ChartComponent;
