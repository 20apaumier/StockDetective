# Stage 1: Base Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 7086

# Stage 2: Build Image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["StockAnalysis.csproj", "./"]
RUN dotnet restore "./StockAnalysis.csproj"

# Copy the remaining source code and build
COPY . .
RUN dotnet build "StockAnalysis.csproj" -c Release -o /app/build

# Stage 3: Publish Image
FROM build AS publish
RUN dotnet publish "StockAnalysis.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 4: Final Image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Configure the application to listen on all network interfaces on port 7086
ENV ASPNETCORE_URLS=http://+:7086
ENV ASPNETCORE_ENVIRONMENT=Development

ENTRYPOINT ["dotnet", "StockAnalysis.dll"]