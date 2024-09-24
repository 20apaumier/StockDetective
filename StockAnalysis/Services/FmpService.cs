using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Skender.Stock.Indicators;
using StockAnalysis.Models;

namespace StockAnalysis.Services
{
    public class FmpService : IFmpService
    {
        private readonly HttpClient _httpClient;
        private readonly FmpApiSettings _apiSettings;

        public FmpService(IHttpClientFactory httpClientFactory, IOptions<FmpApiSettings> options)
        {
            _apiSettings = options.Value;
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.BaseAddress = new Uri(_apiSettings.BaseUrl);
        }

        public async Task<List<StockData>> GetHistoricalPricesAsync(string symbol, string from = null, string to = null)
        {
            try
            {
                var endpoint = $"historical-price-full/{symbol}";

                var queryParams = new List<string>();
                if (!string.IsNullOrEmpty(from))
                {
                    queryParams.Add($"from={from}");
                }
                if (!string.IsNullOrEmpty(to))
                {
                    queryParams.Add($"to={to}");
                }
                queryParams.Add($"apikey={_apiSettings.ApiKey}");

                var url = $"{_httpClient.BaseAddress}/{endpoint}?{string.Join("&", queryParams)}";

                Console.WriteLine(url);

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Error: {response.StatusCode}, Content: {errorContent}");
                    return null;
                }

                var data = await response.Content.ReadFromJsonAsync<FmpHistoricalDataResponse>();
                return data?.Historical;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in GetHistoricalPricesAsync: {ex.Message}");
                return null;
            }
        }

        public async Task<List<IndicatorData>> GetIndicatorAsync(string symbol, string indicator)
        {
            try
            {
                var endpoint = $"technical_indicator/daily/{symbol}?period=14&type={indicator}&apikey={_apiSettings.ApiKey}";
                var response = await _httpClient.GetAsync(endpoint);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Error fetching indicator {indicator}: {response.StatusCode}, Content: {errorContent}");
                    return null;
                }

                var data = await response.Content.ReadFromJsonAsync<FmpIndicatorResponse>();
                return data?.TechnicalIndicator;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in GetIndicatorAsync: {ex.Message}");
                return null;
            }
        }
    }
}
