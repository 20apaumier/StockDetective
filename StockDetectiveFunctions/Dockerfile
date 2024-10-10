# Use the official Azure Functions .NET isolated image
FROM mcr.microsoft.com/azure-functions/dotnet-isolated:4-dotnet-isolated8.0 AS base
WORKDIR /home/site/wwwroot

# Use the .NET SDK image to build the function
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the Azure Functions project file and the SharedModels project file
COPY ["StockDetectiveFunctions/StockDetectiveFunctions.csproj", "./"]
COPY ["SharedModels/SharedModels.csproj", "../SharedModels/"]

# Restore dependencies for both projects
RUN dotnet restore "./StockDetectiveFunctions.csproj"

# Copy the entire Azure Functions project and the SharedModels project
COPY . .

# Build the Azure Functions project
WORKDIR "/src/StockDetectiveFunctions"
RUN dotnet build "StockDetectiveFunctions.csproj" -c Release -o /app/build

# Publish the build
FROM build AS publish
RUN dotnet publish "StockDetectiveFunctions.csproj" -c Release -o /home/site/wwwroot

# Use the base image to run the function app
FROM base AS final
WORKDIR /home/site/wwwroot
COPY --from=publish /home/site/wwwroot .
