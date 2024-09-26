using Microsoft.Extensions.Options;
using StockAnalysis.Models;

namespace StockAnalysis.Services
{
    // FmpService implements IFmpService interface and provides methods to fetch stock data and indicators from the FMP API
    public class FmpService : IFmpService
    {
        private readonly HttpClient _httpClient; // http client for making http requests
        private readonly FmpApiSettings _apiSettings; // settings for connecting to API

        // constructor to inject dependencies
        public FmpService(IHttpClientFactory httpClientFactory, IOptions<FmpApiSettings> options)
        {
            if (httpClientFactory == null)
                throw new ArgumentNullException(nameof(httpClientFactory));

            if (options == null)
                throw new ArgumentNullException(nameof(options));

            if (options.Value == null)
                throw new ArgumentException("options.Value cannot be null", nameof(options));

            _apiSettings = options.Value; // access API settings

            _httpClient = httpClientFactory.CreateClient(); // create HttpClient instance

            if (_httpClient == null)
                throw new InvalidOperationException("The IHttpClientFactory returned null.");

            _httpClient.BaseAddress = new Uri(_apiSettings.BaseUrl); // set base address
        }

        // method to fetch historical stock prices for a given symbol and optional to/from dates
        public async Task<List<StockData>> GetHistoricalPricesAsync(string symbol, string from = null, string to = null)
        {
            try
            {
                // first part of url
                var partialURL = $"{_httpClient.BaseAddress}/historical-price-full/{symbol}";

                // Build other part of url with query parameters for date range and API key
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

                // construct url
                var url = $"{partialURL}?{string.Join("&", queryParams)}";

                // call api
                var response = await _httpClient.GetAsync(url);

                // if error from api
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Error: {response.StatusCode}, Content: {errorContent}");
                    return null;
                }

                // if success, deserialize the content into FmpHistoricalDataResponse object and return data
                var data = await response.Content.ReadFromJsonAsync<FmpHistoricalDataResponse>();
                return data?.Historical;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in GetHistoricalPricesAsync: {ex.Message}");
                return null;
            }
        }

        // method to fetch indicator from API (I do not believe I am currently using this)
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
