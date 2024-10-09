using StockAnalysis.Models;
using StockAnalysis.Services;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using StockAnalysis.Repositories;

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

builder.Services.Configure<MongoDBSettings>(builder.Configuration.GetSection("MongoDBSettings"));
builder.Services.AddSingleton<IMongoClient>(s =>
	new MongoClient(builder.Configuration.GetValue<string>("MongoDBSettings:ConnectionString")));

builder.Services.AddScoped(s =>
{
	var settings = s.GetRequiredService<IOptions<MongoDBSettings>>().Value;
	var client = s.GetRequiredService<IMongoClient>();
	return client.GetDatabase(settings.DatabaseName);
});

builder.Services.AddScoped<NotificationRepository>();

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
		});
});

var app = builder.Build();

// Configure middleware
app.UseSwagger();
app.UseSwaggerUI();

// Remove or conditionally apply HTTPS redirection
// app.UseHttpsRedirection();

app.UseAuthorization();
app.UseCors("AllowReactApp");
app.MapControllers();

// Map Health Check Endpoint
//app.MapHealthChecks("/health");

app.Run();