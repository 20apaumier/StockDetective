# Overview
The **Stock Detective** project is designed to provide an interactive platform for analyzing stock market data. 
Users can view historical stock prices, apply technical indicators like MACD, RSI, and SMA, 
simulate trading strategies, and set up notifications for specific stock conditions.

## Features
- Stock Chart Visualization: Display interactive candlestick charts for selected stock symbols.
- Time Frame Selection: Choose from various time frames to view historical data.
- Technical Indicators: Toggle technical indicators like MACD, RSI, and SMA on the charts.
- Trade Simulation: Input trade parameters to simulate trading strategies and view potential profits.
- Notifications: Set up notifications based on specific conditions and indicators.
- RESTful API: Backend APIs for fetching stock data and managing notifications.
- Integration with External Services:
    - Financial Modeling Prep (FMP) API: Retrieve stock market data.
    - Azure Table Storage: Store and manage user notifications.

## Technologies Used

### Frontend
- React: JavaScript library for building user interfaces.
- TypeScript: Typed superset of JavaScript that adds static typing.
- Vite: Frontend build tool for faster development.
- Axios: Promise-based HTTP client for making API requests.
- Jest: JavaScript testing framework to ensure correctness of code.

### Backend
- ASP.NET Core: Open-source framework for building web applications and APIs.
- C#: Programming language used for backend development.
- Azure Table Storage: NoSQL data storage for storing notifications.
- Azure Functions: Timer-driven trigger for handling notifications.
