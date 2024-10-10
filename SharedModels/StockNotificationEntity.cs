using Azure;
using Azure.Data.Tables;

namespace SharedModels
{
	public class StockNotificationEntity : ITableEntity
	{
		public string PartitionKey { get; set; }
		public string RowKey { get; set; }
		public DateTimeOffset? Timestamp { get; set; }
		public ETag ETag { get; set; }

		public string StockSymbol { get; set; }
		public string Indicator { get; set; }
		public double Threshold { get; set; }
		public string Condition { get; set; }

		public StockNotificationEntity(string email, string stockSymbol, string indicator)
		{
			PartitionKey = email;
			RowKey = $"{stockSymbol}-{indicator}";
		}

		public StockNotificationEntity() { }
	}
}
