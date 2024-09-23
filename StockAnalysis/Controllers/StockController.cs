using Microsoft.AspNetCore.Mvc;
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

        [HttpGet("{symbol}")]
        public async Task<IActionResult> GetStockData(string symbol)
        {
            var stockData = await _fmpService.GetHistoricalPricesAsync(symbol);
            if (stockData == null || stockData.Count == 0)
            {
                return NotFound(new { Message = $"Stock data for symbol '{symbol}' not found." });
            }

            return Ok(stockData);
        }
    }
}
