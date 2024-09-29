using StockAnalysis.Models;
using StockAnalysis.Services;

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

// Register Health Checks
//builder.Services.AddHealthChecks()
//    .AddUrlGroup(new Uri(builder.Configuration["FmpApi:BaseUrl"] + "/ping"), name: "FMP API");

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