﻿using System.Collections.Generic;
using System.Threading.Tasks;
using StockAnalysis.Models;
using StockAnalysis.Models;

namespace StockAnalysis.Services
{
    public interface IFmpService
    {
        Task<List<StockData>> GetHistoricalPricesAsync(string symbol, string from = null, string to = null);
        Task<List<IndicatorData>> GetIndicatorAsync(string symbol, string indicator);
    }
}
