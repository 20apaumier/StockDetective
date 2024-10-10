# Use the official ASP.NET Core runtime as a parent image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 7086

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project files and restore dependencies (includes SharedModels reference)
COPY ["StockAnalysis/StockAnalysis.csproj", "./"]
RUN dotnet restore "./StockAnalysis.csproj"

# Copy the rest of the code
COPY . .

# Build the project
WORKDIR "/src/StockAnalysis"
RUN dotnet build "StockAnalysis.csproj" -c Release -o /app/build

# Publish the app
FROM build AS publish
RUN dotnet publish "StockAnalysis.csproj" -c Release -o /app/publish

# Use the base image to run the app
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "StockAnalysis.dll"]