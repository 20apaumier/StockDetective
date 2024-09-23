using StockAnalysis.Models;
using StockAnalysis.Services;

var builder = WebApplication.CreateBuilder(args);

// Add user secrets when in development
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

// Configure FmpApiSettings
builder.Services.Configure<FmpApiSettings>(
    builder.Configuration.GetSection("FmpApi"));

// Register IHttpClientFactory and IFmpService
builder.Services.AddHttpClient();
builder.Services.AddScoped<IFmpService, FmpService>();

// Add controllers and other services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5174")
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.UseCors("AllowReactApp");

app.Run();
