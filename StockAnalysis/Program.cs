using StockAnalysis.Models;
using StockAnalysis.Services;
using MongoDB.Driver;
using MongoDB.Bson;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Load configuration from user secrets and environment variables
builder.Configuration
    .AddUserSecrets<Program>()
    .AddEnvironmentVariables();

// Configure FmpApiSettings
builder.Services.Configure<FmpApiSettings>(
    builder.Configuration.GetSection("FmpApi"));

// Register IHttpClientFactory and IFmpService
builder.Services.AddHttpClient();
builder.Services.AddScoped<IFmpService, FmpService>();

builder.Services.AddScoped<StockNotificationService>();

// Add controllers and other services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.SetIsOriginAllowed(origin =>
		{
                // Allow any origin that is localhost
                return new Uri(origin).Host == "localhost";
            })
				   .AllowAnyMethod()
				   .AllowAnyHeader();
			options.AddPolicy("AllowFrontendApp", policy =>
			{
				policy.WithOrigins("http://localhost:5173")
					  .AllowAnyHeader()
					  .AllowAnyMethod();
			});
		});
});

var app = builder.Build();

app.UseCors("AllowReactApp");
app.UseCors("AllowFrontendApp");

// Configure middleware
app.UseSwagger();
app.UseSwaggerUI();

// Remove or conditionally apply HTTPS redirection
// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Map Health Check Endpoint
//app.MapHealthChecks("/health");

app.Run();