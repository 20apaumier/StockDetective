using MongoDB.Driver;
using StockAnalysis.Models;

namespace StockAnalysis.Repositories
{
	public class NotificationRepository
	{
		private readonly IMongoCollection<Notification> _notifications;

		public NotificationRepository(IMongoDatabase database)
		{
			_notifications = database.GetCollection<Notification>("Notifications");
		}

		public async Task<List<Notification>> GetByEmailOrPhoneAsync(string emailOrPhone)
		{
			var filter = Builders<Notification>.Filter.Or(
				Builders<Notification>.Filter.Eq(n => n.Email, emailOrPhone),
				Builders<Notification>.Filter.Eq(n => n.PhoneNumber, emailOrPhone)
			);

			return await _notifications.Find(filter).ToListAsync();
		}

		public async Task<List<Notification>> GetByEmailAsync(string email)
		{
			var filter = Builders<Notification>.Filter.Eq(n => n.Email, email);
			return await _notifications.Find(filter).ToListAsync();
		}

		public async Task<List<Notification>> GetByPhoneAsync(string phoneNumber)
		{
			var filter = Builders<Notification>.Filter.Eq(n => n.PhoneNumber, phoneNumber);
			return await _notifications.Find(filter).ToListAsync();
		}

		public async Task<Notification> GetByIdAsync(string id)
		{
			return await _notifications.Find(n => n.Id == id).FirstOrDefaultAsync();
		}

		public async Task CreateAsync(Notification notification)
		{
			await _notifications.InsertOneAsync(notification);
		}

		public async Task DeleteAsync(string id)
		{
			var filter = Builders<Notification>.Filter.Eq(n => n.Id, id);
			await _notifications.DeleteOneAsync(filter);
		}
	}
}
