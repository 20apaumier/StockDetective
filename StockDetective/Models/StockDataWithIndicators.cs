namespace StockAnalysis.Models
{
    public class StockDataWithIndicators
    {
        public DateTime Date { get; set; }
        public decimal Open { get; set; }
        public decimal High { get; set; }
        public decimal Low { get; set; }
        public decimal Close { get; set; }
        public long Volume { get; set; }

        // Technical Indicators
        public decimal? Macd { get; set; }
        public decimal? MacdSignal { get; set; }
        public decimal? MacdHistogram { get; set; }
        public decimal? Rsi { get; set; }
        public decimal? Sma { get; set; }
    }
}

