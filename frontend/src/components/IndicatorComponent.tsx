import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { LineData } from '../types';

interface IndicatorComponentProps {
    data: LineData[];
    type: 'MACD' | 'RSI' | 'SMA';
}

const IndicatorComponent: React.FC<IndicatorComponentProps> = ({ data, type }) => {
    // references for chart container, chart api, series api
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartApiRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

    // Effect to initialize and update the chart
    useEffect(() => {
        // only create the chart if the container exists and there's data
        if (chartContainerRef.current && data.length > 0) {
            const chart = createChart(chartContainerRef.current, {
                width: chartContainerRef.current.clientWidth || 600,
                height: 150,
                layout: { background: { color: '#FFFFFF' }, textColor: '#000' },
                rightPriceScale: { borderColor: '#D1D4DC' },
                timeScale: { borderColor: '#D1D4DC' },
            });
            chartApiRef.current = chart;

            // add the line series with color based on indicator type
            seriesRef.current = chart.addLineSeries({
                color: type === 'MACD' ? 'red' : type === 'RSI' ? 'green' : 'blue',
                lineWidth: 2,
            });

            // Set the chart data
            seriesRef.current.setData(data);

            // adjust chart to fit all data points
            chartApiRef.current.timeScale().fitContent();
        }

        // Cleanup chart when the component unmounts or data changes
        return () => {
            chartApiRef.current?.remove();
            chartApiRef.current = null;
        };
    }, [data, type]); // chart updates on data or type changes

    // Render nothing if there's no data
    if (data.length === 0) {
        return null;
    }

    return (
        <div
            className="indicator-container"
            ref={chartContainerRef}
            style={{ width: '100%', height: '150px' }}
            data-testid="indicator-chart" // Added data-testid here
        ></div>
    );
};

export default IndicatorComponent;