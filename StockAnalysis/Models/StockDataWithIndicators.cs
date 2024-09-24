namespace StockAnalysis.Models
{
    public class StockDataWithIndicators
    {
        public DateTime Date { get; set; }
        public decimal Close { get; set; }
        public double? Macd { get; set; }
        public double? MacdSignal { get; set; }
        public double? MacdHistogram { get; set; }
        public double? Rsi { get; set; }
        public double? Sma { get; set; }
    }
}

