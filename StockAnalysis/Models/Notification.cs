using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;

namespace StockAnalysis.Models
{
	public class Notification
	{
		[BsonId]
		[BsonRepresentation(BsonType.ObjectId)]
		public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

		[EmailAddress]
		public string Email { get; set; }

		public string PhoneNumber { get; set; }

		[Required]
		public string Indicator { get; set; }

		[Required]
		public string StockSymbol { get; set; }

		[Required]
		public double Threshold { get; set; }

		[Required]
		public string Condition { get; set; }

		// Validation to ensure at least one contact method is provided
		public bool IsValid()
		{
			return !string.IsNullOrEmpty(Email) || !string.IsNullOrEmpty(PhoneNumber);
		}
	}
}
