using System.Net;
using FluentAssertions;
using Moq;
using RichardSzalay.MockHttp;
using StockAnalysis.Models;
using StockAnalysis.Services;
using Microsoft.Extensions.Options;

namespace StockAnalysis.Tests
{
    public class FmpServiceTests
    {
        [Test]
        public async Task GetHistoricalPricesAsync_ReturnsData_WhenApiResponseIsSuccessful()
        {
            // Arrange
            var symbol = "AAPL";
            var fromDate = "2021-01-01";
            var toDate = "2021-01-31";

            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "https://financialmodelingprep.com/api/v3",
                ApiKey = "test_api_key"
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            // Mock HTTP response
            var mockHttp = new MockHttpMessageHandler();

            var expectedData = new FmpHistoricalDataResponse
            {
                Historical = new List<StockData>
                {
                    new StockData { Date = "2021-01-01", Open = 132.43M, Close = 129.41M },
                    new StockData { Date = "2021-01-02", Open = 130.53M, Close = 131.12M }
                }
            };

            var jsonResponse = System.Text.Json.JsonSerializer.Serialize(expectedData);

            var requestUrl = $"{apiSettings.BaseUrl}/historical-price-full/{symbol}?from={fromDate}&to={toDate}&apikey={apiSettings.ApiKey}";

            mockHttp.When(requestUrl)
                    .Respond("application/json", jsonResponse);

            var httpClient = new HttpClient(mockHttp)
            {
                BaseAddress = new Uri(apiSettings.BaseUrl)
            };

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(_ => _.CreateClient(It.IsAny<string>())).Returns(httpClient);

            var fmpService = new FmpService(httpClientFactoryMock.Object, optionsMock.Object);

            // Act
            var result = await fmpService.GetHistoricalPricesAsync(symbol, fromDate, toDate);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().BeEquivalentTo(expectedData.Historical);

            // Verify that no outstanding expectations are left
            mockHttp.VerifyNoOutstandingExpectation();
            mockHttp.VerifyNoOutstandingRequest();
        }

        [Test]
        public async Task GetHistoricalPricesAsync_ReturnsData_WhenSymbolIsValid_AndDatesAreNull()
        {
            // Arrange
            var symbol = "AAPL";

            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "https://financialmodelingprep.com/api/v3",
                ApiKey = "test_api_key"
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            // Mock HTTP response
            var mockHttp = new MockHttpMessageHandler();

            var expectedData = new FmpHistoricalDataResponse
            {
                Historical = new List<StockData>
        {
            new StockData { Date = "2021-01-01", Open = 132.43M, Close = 129.41M },
            new StockData { Date = "2021-01-02", Open = 130.53M, Close = 131.12M }
        }
            };

            var jsonResponse = System.Text.Json.JsonSerializer.Serialize(expectedData);

            var requestUrl = $"{apiSettings.BaseUrl}/historical-price-full/{symbol}?apikey={apiSettings.ApiKey}";

            mockHttp.When(requestUrl)
                    .Respond("application/json", jsonResponse);

            var httpClient = new HttpClient(mockHttp)
            {
                BaseAddress = new Uri(apiSettings.BaseUrl)
            };

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(_ => _.CreateClient(It.IsAny<string>())).Returns(httpClient);

            var fmpService = new FmpService(httpClientFactoryMock.Object, optionsMock.Object);

            // Act
            var result = await fmpService.GetHistoricalPricesAsync(symbol);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().BeEquivalentTo(expectedData.Historical);

            // Verify that no outstanding expectations are left
            mockHttp.VerifyNoOutstandingExpectation();
            mockHttp.VerifyNoOutstandingRequest();
        }

        [Test]
        public async Task GetHistoricalPricesAsync_ReturnsNull_WhenApiResponseIsUnsuccessful()
        {
            // Arrange
            var symbol = "AAPL";

            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "https://financialmodelingprep.com/api/v3",
                ApiKey = "test_api_key"
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            // Mock HTTP response with error status code
            var mockHttp = new MockHttpMessageHandler();

            var requestUrl = $"{apiSettings.BaseUrl}/historical-price-full/{symbol}?apikey={apiSettings.ApiKey}";

            mockHttp.When(requestUrl)
                    .Respond(HttpStatusCode.InternalServerError);

            var httpClient = new HttpClient(mockHttp)
            {
                BaseAddress = new Uri(apiSettings.BaseUrl)
            };

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(_ => _.CreateClient(It.IsAny<string>())).Returns(httpClient);

            var fmpService = new FmpService(httpClientFactoryMock.Object, optionsMock.Object);

            // Act
            var result = await fmpService.GetHistoricalPricesAsync(symbol);

            // Assert
            result.Should().BeNull();

            // Verify that no outstanding expectations are left
            mockHttp.VerifyNoOutstandingExpectation();
            mockHttp.VerifyNoOutstandingRequest();
        }

        [Test]
        public async Task GetHistoricalPricesAsync_ReturnsNull_WhenExceptionIsThrown()
        {
            // Arrange
            var symbol = "AAPL";

            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "https://financialmodelingprep.com/api/v3",
                ApiKey = "test_api_key"
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            // Mock HttpClient to throw an exception
            var mockHttp = new MockHttpMessageHandler();

            var requestUrl = $"{apiSettings.BaseUrl}/historical-price-full/{symbol}?apikey={apiSettings.ApiKey}";

            mockHttp.When(requestUrl)
                    .Throw(new HttpRequestException("Network error"));

            var httpClient = new HttpClient(mockHttp)
            {
                BaseAddress = new Uri(apiSettings.BaseUrl)
            };

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(_ => _.CreateClient(It.IsAny<string>())).Returns(httpClient);

            var fmpService = new FmpService(httpClientFactoryMock.Object, optionsMock.Object);

            // Act
            var result = await fmpService.GetHistoricalPricesAsync(symbol);

            // Assert
            result.Should().BeNull();

            // Verify that no outstanding expectations are left
            mockHttp.VerifyNoOutstandingExpectation();
            mockHttp.VerifyNoOutstandingRequest();
        }

        [TestCase(null)]
        [TestCase("")]
        [TestCase("   ")]
        public async Task GetHistoricalPricesAsync_ReturnsNull_WhenSymbolIsInvalid(string? invalidSymbol)
        {
            // Arrange
            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "https://financialmodelingprep.com/api/v3",
                ApiKey = "test_api_key"
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            var mockHttp = new MockHttpMessageHandler();

            var httpClient = new HttpClient(mockHttp)
            {
                BaseAddress = new Uri(apiSettings.BaseUrl)
            };

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(_ => _.CreateClient(It.IsAny<string>())).Returns(httpClient);

            var fmpService = new FmpService(httpClientFactoryMock.Object, optionsMock.Object);

            // Act
            var result = await fmpService.GetHistoricalPricesAsync(invalidSymbol);

            // Assert
            result.Should().BeNull();
        }

        [TestCase("AAPL", "invalid-date", "2021-01-31")]
        [TestCase("AAPL", "2021-01-01", "invalid-date")]
        [TestCase("AAPL", "invalid-date", "invalid-date")]
        public async Task GetHistoricalPricesAsync_ReturnsNull_WhenDatesAreInvalid(string symbol, string fromDate, string toDate)
        {
            // Arrange
            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "https://financialmodelingprep.com/api/v3",
                ApiKey = "test_api_key"
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            // Mock HTTP response with BadRequest
            var mockHttp = new MockHttpMessageHandler();

            var requestUrl = $"{apiSettings.BaseUrl}/historical-price-full/{symbol}?from={fromDate}&to={toDate}&apikey={apiSettings.ApiKey}";

            mockHttp.When(requestUrl)
                    .Respond(HttpStatusCode.BadRequest);

            var httpClient = new HttpClient(mockHttp)
            {
                BaseAddress = new Uri(apiSettings.BaseUrl)
            };

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(_ => _.CreateClient(It.IsAny<string>())).Returns(httpClient);

            var fmpService = new FmpService(httpClientFactoryMock.Object, optionsMock.Object);

            // Act
            var result = await fmpService.GetHistoricalPricesAsync(symbol, fromDate, toDate);

            // Assert
            result.Should().BeNull();

            // Verify that no outstanding expectations are left
            mockHttp.VerifyNoOutstandingExpectation();
            mockHttp.VerifyNoOutstandingRequest();
        }

        [Test]
        public async Task GetHistoricalPricesAsync_ReturnsNull_WhenJsonResponseIsMalformed()
        {
            // Arrange
            var symbol = "AAPL";

            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "https://financialmodelingprep.com/api/v3",
                ApiKey = "test_api_key"
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            // Malformed JSON
            var jsonResponse = "{ 'Historical': [ { 'Date': '2021-01-01', 'Open': 132.43, 'Close': 129.41 ";

            var mockHttp = new MockHttpMessageHandler();

            var requestUrl = $"{apiSettings.BaseUrl}/historical-price-full/{symbol}?apikey={apiSettings.ApiKey}";

            mockHttp.When(requestUrl)
                    .Respond("application/json", jsonResponse);

            var httpClient = new HttpClient(mockHttp)
            {
                BaseAddress = new Uri(apiSettings.BaseUrl)
            };

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(_ => _.CreateClient(It.IsAny<string>())).Returns(httpClient);

            var fmpService = new FmpService(httpClientFactoryMock.Object, optionsMock.Object);

            // Act & Assert
            var result = await fmpService.GetHistoricalPricesAsync(symbol);

            result.Should().BeNull();

            // Verify that no outstanding expectations are left
            mockHttp.VerifyNoOutstandingExpectation();
            mockHttp.VerifyNoOutstandingRequest();
        }

        [Test]
        public async Task GetHistoricalPricesAsync_ReturnsNull_WhenResponseContentIsEmpty()
        {
            // Arrange
            var symbol = "AAPL";

            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "https://financialmodelingprep.com/api/v3",
                ApiKey = "test_api_key"
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            var mockHttp = new MockHttpMessageHandler();

            var requestUrl = $"{apiSettings.BaseUrl}/historical-price-full/{symbol}?apikey={apiSettings.ApiKey}";

            // Respond with empty content
            mockHttp.When(requestUrl)
                    .Respond("application/json", "");

            var httpClient = new HttpClient(mockHttp)
            {
                BaseAddress = new Uri(apiSettings.BaseUrl)
            };

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(_ => _.CreateClient(It.IsAny<string>())).Returns(httpClient);

            var fmpService = new FmpService(httpClientFactoryMock.Object, optionsMock.Object);

            // Act
            var result = await fmpService.GetHistoricalPricesAsync(symbol);

            // Assert
            result.Should().BeNull();

            // Verify that no outstanding expectations are left
            mockHttp.VerifyNoOutstandingExpectation();
            mockHttp.VerifyNoOutstandingRequest();
        }

        [Test]
        public async Task GetHistoricalPricesAsync_ReturnsNull_WhenDataIsMissingInResponse()
        {
            // Arrange
            var symbol = "AAPL";

            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "https://financialmodelingprep.com/api/v3",
                ApiKey = "test_api_key"
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            // Response without 'Historical' data
            var jsonResponse = "{}";

            var mockHttp = new MockHttpMessageHandler();

            var requestUrl = $"{apiSettings.BaseUrl}/historical-price-full/{symbol}?apikey={apiSettings.ApiKey}";

            mockHttp.When(requestUrl)
                    .Respond("application/json", jsonResponse);

            var httpClient = new HttpClient(mockHttp)
            {
                BaseAddress = new Uri(apiSettings.BaseUrl)
            };

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(_ => _.CreateClient(It.IsAny<string>())).Returns(httpClient);

            var fmpService = new FmpService(httpClientFactoryMock.Object, optionsMock.Object);

            // Act
            var result = await fmpService.GetHistoricalPricesAsync(symbol);

            // Assert
            result.Should().BeNull();

            // Verify that no outstanding expectations are left
            mockHttp.VerifyNoOutstandingExpectation();
            mockHttp.VerifyNoOutstandingRequest();
        }

        [Test]
        public async Task GetHistoricalPricesAsync_ReturnsEmptyList_WhenSymbolHasNoHistoricalData()
        {
            // Arrange
            var symbol = "NO_DATA_SYMBOL";

            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "https://financialmodelingprep.com/api/v3",
                ApiKey = "test_api_key"
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            // Response with empty 'Historical' data
            var jsonResponse = "{ \"Historical\": [] }";

            var mockHttp = new MockHttpMessageHandler();

            var requestUrl = $"{apiSettings.BaseUrl}/historical-price-full/{symbol}?apikey={apiSettings.ApiKey}";

            mockHttp.When(requestUrl)
                    .Respond("application/json", jsonResponse);

            var httpClient = new HttpClient(mockHttp)
            {
                BaseAddress = new Uri(apiSettings.BaseUrl)
            };

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(_ => _.CreateClient(It.IsAny<string>())).Returns(httpClient);

            var fmpService = new FmpService(httpClientFactoryMock.Object, optionsMock.Object);

            // Act
            var result = await fmpService.GetHistoricalPricesAsync(symbol);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();

            // Verify that no outstanding expectations are left
            mockHttp.VerifyNoOutstandingExpectation();
            mockHttp.VerifyNoOutstandingRequest();
        }

        [Test]
        public async Task GetHistoricalPricesAsync_HandlesLargeDataset()
        {
            // Arrange
            var symbol = "AAPL";

            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "https://financialmodelingprep.com/api/v3",
                ApiKey = "test_api_key"
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            // Generate a large dataset
            var largeHistoricalData = new List<StockData>();
            for (int i = 0; i < 1000; i++)
            {
                largeHistoricalData.Add(new StockData
                {
                    Date = DateTime.Now.AddDays(-i).ToString("yyyy-MM-dd"),
                    Open = 100M + i,
                    Close = 100M + i
                });
            }

            var expectedData = new FmpHistoricalDataResponse
            {
                Historical = largeHistoricalData
            };

            var jsonResponse = System.Text.Json.JsonSerializer.Serialize(expectedData);

            var requestUrl = $"{apiSettings.BaseUrl}/historical-price-full/{symbol}?apikey={apiSettings.ApiKey}";

            var mockHttp = new MockHttpMessageHandler();

            mockHttp.When(requestUrl)
                    .Respond("application/json", jsonResponse);

            var httpClient = new HttpClient(mockHttp)
            {
                BaseAddress = new Uri(apiSettings.BaseUrl)
            };

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(h => h.CreateClient(It.IsAny<string>())).Returns(httpClient);

            var fmpService = new FmpService(httpClientFactoryMock.Object, optionsMock.Object);

            // Act
            var result = await fmpService.GetHistoricalPricesAsync(symbol);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1000);
            result.Should().BeEquivalentTo(expectedData.Historical);

            // Verify that no outstanding expectations are left
            mockHttp.VerifyNoOutstandingExpectation();
            mockHttp.VerifyNoOutstandingRequest();
        }

        [Test]
        public async Task GetHistoricalPricesAsync_ReturnsNull_OnNetworkTimeout()
        {
            // Arrange
            var symbol = "AAPL";

            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "https://financialmodelingprep.com/api/v3",
                ApiKey = "test_api_key"
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            var mockHttp = new MockHttpMessageHandler();

            var requestUrl = $"{apiSettings.BaseUrl}/historical-price-full/{symbol}?apikey={apiSettings.ApiKey}";

            mockHttp.When(requestUrl)
                    .Throw(new TaskCanceledException("A task was canceled."));

            var httpClient = new HttpClient(mockHttp)
            {
                BaseAddress = new Uri(apiSettings.BaseUrl),
                Timeout = TimeSpan.FromSeconds(1)
            };

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(h => h.CreateClient(It.IsAny<string>())).Returns(httpClient);

            var fmpService = new FmpService(httpClientFactoryMock.Object, optionsMock.Object);

            // Act & Assert
            var result = await fmpService.GetHistoricalPricesAsync(symbol);

            result.Should().BeNull();

            // Verify that no outstanding expectations are left
            mockHttp.VerifyNoOutstandingExpectation();
            mockHttp.VerifyNoOutstandingRequest();
        }

        [Test]
        public void FmpService_ThrowsException_WhenHttpClientFactoryReturnsNull()
        {
            // Arrange
            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "https://financialmodelingprep.com/api/v3",
                ApiKey = "test_api_key"
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(h => h.CreateClient(It.IsAny<string>())).Returns((HttpClient)null);

            // Act & Assert
            var exception = Assert.Throws<InvalidOperationException>(() =>
                new FmpService(httpClientFactoryMock.Object, optionsMock.Object));

            exception.Message.Should().Be("The IHttpClientFactory returned null.");
        }

        [Test]
        public async Task GetHistoricalPricesAsync_ReturnsNull_WhenApiKeyIsMissingOrInvalid()
        {
            // Arrange
            var symbol = "AAPL";

            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "https://financialmodelingprep.com/api/v3",
                ApiKey = "" // Missing API Key
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            var mockHttp = new MockHttpMessageHandler();

            var requestUrl = $"{apiSettings.BaseUrl}/historical-price-full/{symbol}?apikey=";

            // API might return 401 Unauthorized
            mockHttp.When(requestUrl)
                    .Respond(HttpStatusCode.Unauthorized);

            var httpClient = new HttpClient(mockHttp)
            {
                BaseAddress = new Uri(apiSettings.BaseUrl)
            };

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(h => h.CreateClient(It.IsAny<string>())).Returns(httpClient);

            var fmpService = new FmpService(httpClientFactoryMock.Object, optionsMock.Object);

            // Act
            var result = await fmpService.GetHistoricalPricesAsync(symbol);

            // Assert
            result.Should().BeNull();

            // Verify that no outstanding expectations are left
            mockHttp.VerifyNoOutstandingExpectation();
            mockHttp.VerifyNoOutstandingRequest();
        }

        [Test]
        public void FmpService_ThrowsUriFormatException_WhenBaseUrlIsInvalid()
        {
            // Arrange
            var apiSettings = new FmpApiSettings
            {
                BaseUrl = "invalid_url", // Invalid Base URL
                ApiKey = "test_api_key"
            };

            var optionsMock = new Mock<IOptions<FmpApiSettings>>();
            optionsMock.Setup(o => o.Value).Returns(apiSettings);

            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(h => h.CreateClient(It.IsAny<string>())).Returns(new HttpClient());

            // Act & Assert
            Assert.Throws<UriFormatException>(() => new FmpService(httpClientFactoryMock.Object, optionsMock.Object));
        }
    }
}