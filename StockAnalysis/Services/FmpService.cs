using Microsoft.Extensions.Options;
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

        public async Task<List<StockData>> GetHistoricalPricesAsync(string symbol)
        {
            // add from value later;
            var endpoint = $"/historical-price-full/{symbol}?apikey={_apiSettings.ApiKey}";
            var fullUrl = _httpClient.BaseAddress + endpoint;
            var response = await _httpClient.GetFromJsonAsync<FmpHistoricalDataResponse>(fullUrl);
            return response?.Historical;
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
