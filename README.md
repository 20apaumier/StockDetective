# Stock Analysis - A Stock Monitoring & Notification System

This project allows users to monitor stock data and receive notifications when certain indicators are triggered. It includes a frontend React app, a backend ASP.NET Web API, and Azure Functions for stock data processing and notifications.

## Project Structure
- **frontend/**: React app that visualizes stock data and allows users to configure notifications.
- **StockAnalysis/**: ASP.NET Web API that provides stock data endpoints and manages user notifications.
- **StockDetectiveFunctions/**: Azure Functions that check stock indicators periodically and notify users.
- **SharedModels/**: Shared model library used by both the backend and the Azure Functions.
- **tests/**: Unit and integration tests for backend and functions.

## Technologies Used
- **React** for the frontend UI
- **ASP.NET Core Web API** for the backend
- **Azure Functions** for background processing
- **Azure Table Storage** for storing user data and notifications
- **Docker** and **Docker Compose** for containerization

## Running Locally with Docker
1. Install Docker.
2. Clone the repository: `git clone https://github.com/YourUsername/StockAnalysis.git`
3. Navigate to the project directory: `cd StockAnalysis`
4. Run the application: `docker-compose up --build`
5. Access the frontend at `http://localhost:5173` and the backend at `http://localhost:7086`.

## API Endpoints
### `/Stock/{symbol}`
Returns stock data for the given symbol.

### `/Notifications`
Manage notification subscriptions for stock indicators.
