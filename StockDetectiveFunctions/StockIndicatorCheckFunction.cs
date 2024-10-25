using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;
using Azure.Data.Tables;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using SharedModels;
using StockAnalysis.Models;
using StockAnalysis.Services;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace StockDetectiveFunctions
{
	public class StockIndicatorCheckFunction
	{
		private readonly IFmpService _fmpService;
		private readonly TableClient _tableClient;
		private readonly ILogger _log;

		public StockIndicatorCheckFunction(IFmpService fmpService, ILoggerFactory loggerFactory)
		{
			_fmpService = fmpService;
			_log = loggerFactory.CreateLogger<StockIndicatorCheckFunction>();

			string connectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage");
			var tableServiceClient = new TableServiceClient(connectionString);
			_tableClient = tableServiceClient.GetTableClient("StockNotifications");
			_tableClient.CreateIfNotExists();
		}

		[Function("StockIndicatorCheckFunction")]
		public async Task Run([TimerTrigger("0 0 0 * * 2-6")] TimerInfo myTimer)
		{
			_log.LogInformation($"Stock check function executed at: {DateTime.Now}");

			var notifications = new List<StockNotificationEntity>();
			var queryResults = _tableClient.QueryAsync<StockNotificationEntity>();

			await foreach (var entity in queryResults)
			{
				notifications.Add(entity);
			}

			foreach (var notification in notifications)
			{
				var indicatorData = await _fmpService.GetIndicatorAsync(notification.StockSymbol, notification.Indicator);

				if (indicatorData != null && indicatorData.Count > 0)
				{
					var latestIndicator = indicatorData.FirstOrDefault();

					if (CheckIndicatorTriggered(notification, latestIndicator))
					{
						await NotifyUser(notification);
					}
				}
				else
				{
					_log.LogWarning($"No indicator data found for {notification.StockSymbol} and indicator {notification.Indicator}");
				}
			}
		}

		private bool CheckIndicatorTriggered(StockNotificationEntity notification, IndicatorData indicatorData)
		{
			if (indicatorData == null)
				return false;

			double indicatorValue = indicatorData.Value;

			if (notification.Condition.Equals("Above", StringComparison.OrdinalIgnoreCase) && indicatorValue > notification.Threshold)
			{
				return true;
			}
			if (notification.Condition.Equals("Below", StringComparison.OrdinalIgnoreCase) && indicatorValue < notification.Threshold)
			{
				return true;
			}

			return false;
		}

		private async Task NotifyUser(StockNotificationEntity notification)
		{
			var apiKey = Environment.GetEnvironmentVariable("SendGrid_ApiKey");
			var client = new SendGridClient(apiKey);
			var from = new EmailAddress("andrewpaumier@gmail.com", "Stock Detective");
			var subject = $"Stock Alert: {notification.StockSymbol} {notification.Condition} {notification.Threshold}";
			var to = new EmailAddress(notification.PartitionKey);
			var plainTextContent = $"The indicator {notification.Indicator} for {notification.StockSymbol} has triggered your alert.";
			var htmlContent = $"<strong>The indicator {notification.Indicator} for {notification.StockSymbol} has triggered your alert.</strong>";
			var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
			var response = await client.SendEmailAsync(msg);
		}
	}
}
