// ChartComponent.tsx
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

interface TradeParameters {
    [indicator: string]: {
        buyThreshold: number;
        sellThreshold: number;
        tradeAmount: number;
        tradeAmountType: 'shares' | 'dollars';
    };
}

const ChartComponent: React.FC<ChartComponentProps> = ({
    chartId,
    stockSymbol,
    addChart,
    removeChart,
}) => {
    const [rawData, setRawData] = useState<StockDataItem[]>([]);
    const [loading, setLoading] = useState(false);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartApiRef = useRef<IChartApi | null>(null);
    const mainSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<number | 'all'>(30);

    // Indicator selection state
    const [showIndicators, setShowIndicators] = useState<{
        macd: boolean;
        rsi: boolean;
        sma: boolean;
    }>({
        macd: false,
        rsi: false,
        sma: false,
    });

    // Indicator data
    const [macdData, setMacdData] = useState<LineData[]>([]);
    const [rsiData, setRsiData] = useState<LineData[]>([]);
    const [smaData, setSmaData] = useState<LineData[]>([]);

    // Trade parameters
    const [tradeParameters, setTradeParameters] = useState<TradeParameters>({});

    // Handle parameters change from TradeParametersComponent
    const handleParametersChange = (params: TradeParameters) => {
        setTradeParameters(params);
    };

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

    // Fetch stock data
    useEffect(() => {
        const fetchStockData = async () => {
            if (stockSymbol) {
                setLoading(true);
                const params: Record<string, string> = {};
                const toDate = new Date();

                if (selectedTimeFrame !== 'all') {
                    const fromDate = subDays(toDate, selectedTimeFrame as number);
                    params.from = fromDate.toISOString().split('T')[0];
                }
                params.to = toDate.toISOString().split('T')[0];

                console.log('API Params:', params);

                try {
                    const response = await axios.get(
                        `http://localhost:7086/Stock/${stockSymbol}`,
                        { params }
                    );
                    console.log('API Response Data:', response.data);

                    const sortedData: StockDataItem[] = response.data.sort(
                        (a: StockDataItem, b: StockDataItem) =>
                            new Date(a.date).getTime() - new Date(b.date).getTime()
                    );
                    setRawData(sortedData);
                    console.log('Raw Data:', sortedData);

                    // Prepare indicator data
                    const prepareIndicatorData = (
                        dataKey: keyof StockDataItem,
                        setter: React.Dispatch<React.SetStateAction<LineData[]>>
                    ) => {
                        const indicatorData: LineData[] = sortedData
                            .map((item) => ({
                                time: format(parseISO(item.date), 'yyyy-MM-dd'),
                                value:
                                    item[dataKey] !== null &&
                                        item[dataKey] !== undefined &&
                                        !isNaN(Number(item[dataKey]))
                                        ? Number(item[dataKey])
                                        : null,
                            }))
                            .filter((item) => item.value !== null);
                        setter(indicatorData as LineData[]);
                        console.log(`${dataKey} Data:`, indicatorData);
                    };

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

    // Initialize chart
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

        // Cleanup function
        return () => {
            chartApiRef.current?.remove();
            chartApiRef.current = null;
        };
    }, []); // Empty dependency array ensures this runs once on mount

    // Update chart data when rawData changes
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

    // Handle indicator selection
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
                style={{ width: '100%', height: '500px' }} // Ensure height is set
            ></div>
            {loading && <div className="loading-overlay">Loading...</div>}

            {/* Time Frame Selection */}
            <div className="time-frame-buttons">
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

            {/* Indicators */}
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
