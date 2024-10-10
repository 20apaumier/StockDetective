using SharedModels;
using Azure.Data.Tables;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.WebJobs;
using Newtonsoft.Json;

namespace StockDetectiveFunctions
{
	public static class StockIndicatorCheckFunction
	{
		private static readonly HttpClient httpClient = new HttpClient();

		[FunctionName("StockIndicatorCheckFunction")]
		public static async Task Run([TimerTrigger("0 0 0 * * 2-6")] TimerInfo myTimer, ILogger log)
		{
			log.LogInformation($"Stock check function executed at: {DateTime.Now}");

			// Connect to Azure Table Storage
			var connectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage");
			var tableServiceClient = new TableServiceClient(connectionString);
			var tableClient = tableServiceClient.GetTableClient("StockNotifications");
			await tableClient.CreateIfNotExistsAsync();

			// Retrieve all notifications
			var notifications = new List<StockNotificationEntity>();
			var queryResults = tableClient.QueryAsync<StockNotificationEntity>();

			await foreach (var entity in queryResults)
			{
				notifications.Add(entity);
			}

			foreach (var notification in notifications)
			{
				// Fetch stock data from your preferred API
				var stockData = await GetStockDataAsync(notification.StockSymbol, notification.Indicator);

				// Check if the indicator condition is met
				if (CheckIndicatorTriggered(notification, stockData))
				{
					// Notify the user (send email, SMS, etc.)
					await NotifyUser(notification);
				}
			}
		}

		private static async Task<StockData> GetStockDataAsync(string stockSymbol, string indicator)
		{
			// Example API call to get stock data (you would replace this with your actual API)
			var apiKey = Environment.GetEnvironmentVariable("StockApiKey");
			var apiUrl = $"https://api.example.com/stock/{stockSymbol}/indicator/{indicator}?apiKey={apiKey}";
			var response = await httpClient.GetStringAsync(apiUrl);
			return JsonConvert.DeserializeObject<StockData>(response);
		}

		private static bool CheckIndicatorTriggered(StockNotificationEntity notification, StockData stockData)
		{
			// Implement your logic to check if the indicator threshold is met
			if (notification.Condition == "Above" && stockData.IndicatorValue > notification.Threshold)
			{
				return true;
			}
			if (notification.Condition == "Below" && stockData.IndicatorValue < notification.Threshold)
			{
				return true;
			}

			return false;
		}

		private static async Task NotifyUser(StockNotificationEntity notification)
		{
			// Implement the notification logic here (e.g., email, SMS, etc.)
			await Task.CompletedTask; // Replace with actual notification code
		}
	}

	// StockData is an example class that you get from the stock API
	public class StockData
	{
		public double IndicatorValue { get; set; }
	}
}
