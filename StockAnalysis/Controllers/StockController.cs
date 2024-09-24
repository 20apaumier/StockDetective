using Microsoft.AspNetCore.Mvc;
using Skender.Stock.Indicators;
using StockAnalysis.Models;
using StockAnalysis.Services;
using System.Threading.Tasks;

namespace StockAnalysis.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class StockController : ControllerBase
    {
        private readonly IFmpService _fmpService;

        public StockController(IFmpService fmpService)
        {
            _fmpService = fmpService;
        }

        [HttpGet("{stockSymbol}")]
        public async Task<IActionResult> GetStockData(string stockSymbol, string? from = null, string? to = null)
        {
            // Fetch stock data
            List<StockData> stockDataList = await _fmpService.GetHistoricalPricesAsync(stockSymbol, from, to);

            // Map to Quote objects
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

            // Merge data
            var dataWithIndicators = (from sd in stockDataList
                                      let date = DateTime.Parse(sd.Date)
                                      join macd in macdResults on date equals macd.Date into macdJoin
                                      from macdResult in macdJoin.DefaultIfEmpty()
                                      join rsi in rsiResults on date equals rsi.Date into rsiJoin
                                      from rsiResult in rsiJoin.DefaultIfEmpty()
                                      join sma in smaResults on date equals sma.Date into smaJoin
                                      from smaResult in smaJoin.DefaultIfEmpty()
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

            return Ok(dataWithIndicators);
        }
    }
}
