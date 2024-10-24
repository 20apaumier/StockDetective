using Azure;
using Azure.Data.Tables;
using System.ComponentModel.DataAnnotations;

namespace SharedModels
{
	public class StockNotificationEntity : ITableEntity
	{
		public string PartitionKey { get; set; }
		public string RowKey { get; set; }
		public DateTimeOffset? Timestamp { get; set; }
		public ETag ETag { get; set; }

		[Required]
		public string StockSymbol { get; set; }
		[Required]
		public string Indicator { get; set; }
		[Required]
		public double Threshold { get; set; }
		[Required]
		public string Condition { get; set; }
		[Required]
		public string Email { get; set; }

		public StockNotificationEntity(string email, string stockSymbol, string indicator)
		{
			PartitionKey = email;
			RowKey = $"{stockSymbol}-{indicator}";
		}

		public StockNotificationEntity() { }
	}
}
