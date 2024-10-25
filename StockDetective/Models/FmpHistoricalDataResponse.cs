namespace StockAnalysis.Models
{
    public class FmpHistoricalDataResponse
    {
        public string Symbol { get; set; }
        public List<StockData> Historical { get; set; }
    }
}
