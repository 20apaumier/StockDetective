import { Time } from 'lightweight-charts';

export interface LineData {
    time: Time;
    value: number;
}

export interface StockDataItem {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}