using Microsoft.AspNetCore.Mvc;
using Skender.Stock.Indicators;
using StockAnalysis.Models;
using StockAnalysis.Services;

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
                Date = DateTime.Parse(sd.Date),
                Open = sd.Open,
                High = sd.High,
                Low = sd.Low,
                Close = sd.Close,
                Volume = sd.Volume
            }).ToList();

            // Compute indicators
            var macdResults = quotes.GetMacd().ToList();
            var rsiResults = quotes.GetRsi().ToList();
            var smaResults = quotes.GetSma(14).ToList(); // 14-period SMA

            // Merge the stock data with computed technical indicators
            var dataWithIndicators = (from sd in stockDataList
                                      let date = DateTime.Parse(sd.Date) // parse data
                                      join macd in macdResults on date equals macd.Date into macdJoin
                                      from macdResult in macdJoin.DefaultIfEmpty() // left join with MACD results
                                      join rsi in rsiResults on date equals rsi.Date into rsiJoin
                                      from rsiResult in rsiJoin.DefaultIfEmpty() // left join with RSI results
                                      join sma in smaResults on date equals sma.Date into smaJoin
                                      from smaResult in smaJoin.DefaultIfEmpty() // left join with SMA results
                                      // new object w stock data and indicators
                                      select new StockDataWithIndicators
                                      {
                                          Date = date,
                                          Close = sd.Close,
                                          Macd = macdResult?.Macd,
                                          MacdSignal = macdResult?.Signal,
                                          MacdHistogram = macdResult?.Histogram,
                                          Rsi = rsiResult?.Rsi,
                                          Sma = smaResult?.Sma
                                      }).ToList();

            // return stock data w indicators and HTTP 200 response
            return Ok(dataWithIndicators);
        }
    }
}
