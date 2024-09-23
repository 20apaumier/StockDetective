namespace StockAnalysis.Models
{
    public class FmpIndicatorResponse
    {
        public string Symbol { get; set; }
        public List<IndicatorData> TechnicalIndicator { get; set; }
    }
}
