FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY SimpleForm.Api/SimpleForm.Api.csproj SimpleForm.Api/
RUN dotnet restore SimpleForm.Api/SimpleForm.Api.csproj

COPY . .
RUN dotnet publish SimpleForm.Api/SimpleForm.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "SimpleForm.Api.dll"]
