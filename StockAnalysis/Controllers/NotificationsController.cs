﻿using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("[controller]")]
public class NotificationsController : ControllerBase
{
	private readonly StockNotificationService _stockNotificationService;

	public NotificationsController(StockNotificationService stockNotificationService)
	{
		_stockNotificationService = stockNotificationService;
	}

	[HttpPost]
	public async Task<IActionResult> AddNotification([FromBody] NotificationRequest request)
	{
		if (string.IsNullOrEmpty(request.Email))
		{
			return BadRequest("Email is required.");
		}

		await _stockNotificationService.AddNotificationAsync(request.Email, request.StockSymbol, request.Indicator, request.Threshold, request.Condition);

		return Ok(new { message = "Notification successfully created!" });
	}

	[HttpGet("{email}")]
	public async Task<IActionResult> GetNotifications(string email)
	{
		var notifications = await _stockNotificationService.GetNotificationsByEmailAsync(email);
		return Ok(notifications);
	}
}

public class NotificationRequest
{
	public string Email { get; set; }
	public string StockSymbol { get; set; }
	public string Indicator { get; set; }
	public double Threshold { get; set; }
	public string Condition { get; set; }
}
