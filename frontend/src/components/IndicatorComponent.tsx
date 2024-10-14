import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { LineData } from '../types';

interface IndicatorComponentProps {
    data: LineData[];
    type: 'MACD' | 'RSI' | 'SMA';
}

const IndicatorComponent: React.FC<IndicatorComponentProps> = ({ data, type }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartApiRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

    // Initialize chart on mount
    useEffect(() => {
        if (chartContainerRef.current && data.length > 0) {
            const chart = createChart(chartContainerRef.current, {
                width: chartContainerRef.current.clientWidth || 600,
                height: 150,
                layout: { background: { color: '#FFFFFF' }, textColor: '#000' },
                rightPriceScale: { borderColor: '#D1D4DC' },
                timeScale: { borderColor: '#D1D4DC' },
            });

            chartApiRef.current = chart;
            seriesRef.current = chart.addLineSeries({
                color: type === 'MACD' ? 'red' : type === 'RSI' ? 'green' : 'blue',
                lineWidth: 2,
            });

            // Set the data
            seriesRef.current.setData(data);
            chartApiRef.current.timeScale().fitContent();
        }

        // Cleanup function
        return () => {
            chartApiRef.current?.remove();
            chartApiRef.current = null;
        };
    }, [data]);

    // Render nothing if there's no data
    if (data.length === 0) {
        return null;
    }

    return (
        <div
            className="indicator-container"
            ref={chartContainerRef}
            style={{ width: '100%', height: '150px' }}
        ></div>
    );
};

export default IndicatorComponent;
