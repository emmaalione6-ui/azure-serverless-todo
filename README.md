# ☁️ Serverless Todo API — Azure Functions + Cosmos DB

A fully serverless REST API and frontend for managing Todo items, built with Azure Functions and Cosmos DB.

## 🏗️ Architecture

![Architecture Diagram](docs/architecture.png)

## ☁️ Azure Services Used

| Service | Purpose | Why |
|---|---|---|
| Azure Functions | HTTP API endpoints | Serverless, pay-per-execution, no server management |
| Cosmos DB (Serverless) | NoSQL database | Flexible schema, serverless billing, fast reads |
| Azure Storage | Function App storage | Required by Functions runtime |

## 🚀 How to Deploy

### Prerequisites
- Azure CLI installed and logged in
- Azure Functions Core Tools v4
- Node.js v18+

### Steps

1. Clone the repo
   git clone <your-repo-url>
   cd todo-api
   npm install

2. Create Azure resources
   az group create --name rg-serverless-todo --location eastus2
   az cosmosdb create --name cosmos-todo-emmaali50 --resource-group rg-serverless-todo --kind GlobalDocumentDB --capabilities EnableServerless --locations regionName=eastus2 failoverPriority=0
   az cosmosdb sql database create --account-name cosmos-todo-emmaali50 --resource-group rg-serverless-todo --name TodoDB
   az cosmosdb sql container create --account-name cosmos-todo-emmaali50 --resource-group rg-serverless-todo --database-name TodoDB --name Items --partition-key-path "/userId"

3. Deploy the Function App
   func azure functionapp publish func-todo-api-emmaali50

4. Open frontend/index.html in a browser

## 📚 What I Learned
- How to build and deploy serverless APIs on Azure
- How Cosmos DB serverless billing works
- How Azure Functions v4 programming model differs from v3
- How to connect Azure Functions to Cosmos DB using connection strings
- The difference between local development and cloud deployment