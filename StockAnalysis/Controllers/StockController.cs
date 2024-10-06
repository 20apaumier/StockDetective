using Microsoft.AspNetCore.Mvc;
using Skender.Stock.Indicators;
using StockAnalysis.Models;
using StockAnalysis.Services;
using System.Globalization;

namespace StockAnalysis.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class StockController : ControllerBase
    {
        // dependency injection for financial data service
        private readonly IFmpService _fmpService;

        // constructor to inject IFmpService
        public StockController(IFmpService fmpService)
        {
            _fmpService = fmpService; // assign injected service
        }

        // HTTP GET method to fetch stock data and calculate technical indicators
        [HttpGet("{stockSymbol}")] // /Stock/{stockSymbol}
        public async Task<IActionResult> GetStockData(string stockSymbol, string? from = null, string? to = null)
        {
            // Fetch stock data from fmp service
            List<StockData> stockDataList = await _fmpService.GetHistoricalPricesAsync(stockSymbol, from, to);

            // Map to Quote objects for Skender lib
            List<Quote> quotes = stockDataList.Select(sd => new Quote
            {
                Date = DateTime.ParseExact(sd.Date, "yyyy-MM-dd", CultureInfo.InvariantCulture),
                Open = sd.Open,
                High = sd.High,
                Low = sd.Low,
                Close = sd.Close,
                Volume = sd.Volume
            }).OrderBy(q => q.Date).ToList();

            // Compute indicators
            var macdResults = quotes.GetMacd().ToList();
            var rsiResults = quotes.GetRsi().ToList();
            var smaResults = quotes.GetSma(14).ToList(); // 14-period SMA

            // Merge the stock data with computed technical indicators
            var dataWithIndicators = stockDataList.Select(sd =>
            {
                var date = DateTime.ParseExact(sd.Date, "yyyy-MM-dd", CultureInfo.InvariantCulture);

                var macdResult = macdResults.FirstOrDefault(m => m.Date == date);
                var rsiResult = rsiResults.FirstOrDefault(r => r.Date == date);
                var smaResult = smaResults.FirstOrDefault(s => s.Date == date);

                return new StockDataWithIndicators
                {
                    Date = date,
                    Open = sd.Open,
                    High = sd.High,
                    Low = sd.Low,
                    Close = sd.Close,
                    Volume = sd.Volume,
                    Macd = macdResult?.Macd != null ? (decimal?)macdResult.Macd : null,
                    MacdSignal = macdResult?.Signal != null ? (decimal?)macdResult.Signal : null,
                    MacdHistogram = macdResult?.Histogram != null ? (decimal?)macdResult.Histogram : null,
                    Rsi = rsiResult?.Rsi != null ? (decimal?)rsiResult.Rsi : null,
                    Sma = smaResult?.Sma != null ? (decimal?)smaResult.Sma : null
                };
            }).OrderBy(d => d.Date).ToList();

            // return stock data w indicators and HTTP 200 response
            return Ok(dataWithIndicators);
        }
    }
}
