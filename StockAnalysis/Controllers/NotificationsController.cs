using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StockAnalysis.Models;
using StockAnalysis.Repositories;

namespace StockAnalysis.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class NotificationsController : ControllerBase
	{
		private readonly NotificationRepository _repository;

		public NotificationsController(NotificationRepository repository)
		{
			_repository = repository;
		}

		// POST /notifications
		[HttpPost]
		public async Task<IActionResult> Create([FromBody] Notification notification)
		{
			if (notification == null)
			{
				return BadRequest("Notification is null.");
			}

			if (!notification.IsValid())
			{
				return BadRequest("At least an email or phone number must be provided.");
			}

			await _repository.CreateAsync(notification);
			return CreatedAtAction(nameof(GetById), new { id = notification.Id }, notification);
		}

		// GET /notifications/{emailOrPhone}
		[HttpGet("{emailOrPhone}")]
		public async Task<ActionResult<List<Notification>>> GetByEmailOrPhone(string emailOrPhone)
		{
			var notifications = await _repository.GetByEmailOrPhoneAsync(emailOrPhone);
			if (notifications == null || notifications.Count == 0)
			{
				return NotFound("No notifications found for the provided email or phone number.");
			}

			return Ok(notifications);
		}

		// GET /notifications/email/{email}
		[HttpGet("email/{email}")]
		public async Task<ActionResult<List<Notification>>> GetByEmail(string email)
		{
			var notifications = await _repository.GetByEmailAsync(email);
			if (notifications == null || notifications.Count == 0)
			{
				return NotFound("No notifications found for the provided email.");
			}

			return Ok(notifications);
		}

		// GET /notifications/phone/{phoneNumber}
		[HttpGet("phone/{phoneNumber}")]
		public async Task<ActionResult<List<Notification>>> GetByPhone(string phoneNumber)
		{
			var notifications = await _repository.GetByPhoneAsync(phoneNumber);
			if (notifications == null || notifications.Count == 0)
			{
				return NotFound("No notifications found for the provided phone number.");
			}

			return Ok(notifications);
		}

		// DELETE /notifications/{id}
		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(string id)
		{
			await _repository.DeleteAsync(id);
			return NoContent();
		}

		// GET /notifications/id/{id}
		[HttpGet("id/{id}")]
		public async Task<ActionResult<Notification>> GetById(string id)
		{
			var notification = await _repository.GetByIdAsync(id);
			if (notification == null)
			{
				return NotFound();
			}

			return Ok(notification);
		}
	}
}
