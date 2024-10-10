using SharedModels;
using Azure.Data.Tables;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using StockAnalysis.Models;

public class StockNotificationService
{
	private readonly TableClient _tableClient;
	private readonly AZSettings _azsettings;

	public StockNotificationService(IOptions<AZSettings> options)
	{
		_azsettings = options.Value;
		string connectionString = _azsettings.ConnectionString;
		var tableServiceClient = new TableServiceClient(connectionString);
		_tableClient = tableServiceClient.GetTableClient("StockNotifications");
		_tableClient.CreateIfNotExists();
	}

	public async Task AddNotificationAsync(string email, string stockSymbol, string indicator, double threshold, string condition)
	{
		var notification = new StockNotificationEntity(email, stockSymbol, indicator)
		{
			StockSymbol = stockSymbol,
			Indicator = indicator,
			Threshold = threshold,
			Condition = condition
		};

		await _tableClient.AddEntityAsync(notification);
	}

	public async Task<List<StockNotificationEntity>> GetNotificationsByEmailAsync(string email)
	{
		var notifications = new List<StockNotificationEntity>();

		var entities = _tableClient.QueryAsync<StockNotificationEntity>(e => e.PartitionKey == email);

		await foreach (var entity in entities)
		{
			notifications.Add(entity);
		}

		return notifications;
	}
}