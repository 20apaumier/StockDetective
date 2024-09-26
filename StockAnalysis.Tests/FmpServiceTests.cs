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
    }
}