# Stock Detective Backend

This is the backend application for the Stock Detective tool, built with **ASP.NET Core** and **C#.** 
It provides APIs for fetching stock data, calculating technical indicators, managing user notifications,
and integrating with external services like Azure and third-party financial APIs.

## Features
- Stock Data API: Fetch historical stock data and compute technical indicators like MACD, RSI, and SMA.
- User Notifications: Allow users to set up notifications based on specific stock conditions and indicators.
- Integration with External Services:
    - Financial Modeling Prep (FMP) API: Retrieve stock market data.
    - Azure Table Storage: Store and manage user notifications.
- Scalable Architecture: Designed using best practices for scalability and maintainability.

## Technologies Used
- ASP.NET Core: Open-source framework for building web applications and APIs.
- C#: Programming language used for backend development.
- Azure Table Storage: NoSQL data storage for storing notifications.
- RESTful API Design: Follows REST principles for API endpoints.

## API Endpoints

### Stock Data Endpoint
- Endpoint: GET /Stock/{stockSymbol}
- Description: Fetches historical stock data for the given symbol and calculates technical indicators.

- Parameters:
    - stockSymbol (required): The stock symbol to fetch data for.
    - from (optional): Start date in yyyy-MM-dd format.
    - to (optional): End date in yyyy-MM-dd format.
 
-Example:
`GET /Stock/AAPL?from=2023-01-01&to=2023-12-31`

### Notifications Endpoint
- Endpoint: POST /Notifications
- Description: Adds a new notification for a user.

- Body:
    `{
  "Email": "user@example.com",
  "StockSymbol": "AAPL",
  "Indicator": "RSI",
  "Threshold": 30,
  "Condition": "Below"
}`
 

- Endpoint: GET /Notifications/{email}

- Description: Retrieves all notifications for a given email address.

Example:
`GET /Notifications/user@example.com`