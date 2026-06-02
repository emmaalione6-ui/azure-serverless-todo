# ☁️ Serverless Todo API — Azure Functions + Cosmos DB + Static Web Apps

![Deploy to Azure Static Web Apps](https://github.com/emmaalione6-ui/azure-serverless-todo/actions/workflows/azure-static-web-apps-blue-meadow-0e8e5b003.yml/badge.svg)
![Azure Functions](https://img.shields.io/badge/Azure-Functions-0062AD?logo=microsoftazure)
![Cosmos DB](https://img.shields.io/badge/Cosmos-DB-0078D4?logo=microsoftazure)
![License](https://img.shields.io/badge/license-MIT-green)

Serverless REST API and frontend for managing Todo items, built with Azure Functions, Cosmos DB, and Static Web Apps. Deployed on Azure with GitHub Actions CI/CD.

---

## 🌐 Live Demo

[View Live App](https://agreeable-sea-00c7f720f.7.azurestaticapps.net/) | [View API Endpoint](https://func-todo-api-emmaal60.azurewebsites.net/api/GetTodos?userId=demo)

> **Note:** The Cosmos DB is on the serverless free tier — the first request may take 2–3 seconds to cold-start.

---

## 🎬 Demo

![App Demo](docs/demo.gif)

> *Screenshot of the running app — add, complete, and delete todo items in real time.*

---

## 🏗️ Architecture

![Architecture Diagram](docs/architecture.png)

| Flow | Description |
|------|-------------|
| Browser → Static Web App | User loads the frontend HTML/JS |
| Static Web App → Azure Functions | JS calls the REST API via HTTP |
| Azure Functions → Cosmos DB | API reads/writes todo items |
| App Settings | Connection string stored securely, never in code |

---

## ☁️ Azure Services Used

| Service | Purpose | Why |
|---|---|---|
| Azure Functions (Consumption) | 4 HTTP-triggered API endpoints | Serverless, pay-per-execution, no server management |
| Cosmos DB (Serverless) | NoSQL database | Flexible schema, serverless billing, fast reads |
| Azure Static Web Apps | Frontend hosting | Zero infrastructure, auto-deploys from GitHub |
| Azure Storage | Function App storage | Required by Functions runtime |
| Azure App Settings | Secret management | Connection strings encrypted at rest, never in code |
| GitHub Actions | CI/CD pipeline | Auto-generated workflow deploys on every push to main |

---

## 📁 Project Structure

```
azure-serverless-todo/
├── .github/
│   └── workflows/
│       └── azure-static-web-apps-*.yml    # CI/CD workflow (auto-generated)
├── frontend/
│   └── index.html                         # Static frontend (HTML/JS)
├── todo-api/
│   ├── src/functions/
│   │   ├── CreateTodo.js                  # POST /api/CreateTodo
│   │   ├── GetTodos.js                    # GET  /api/GetTodos
│   │   ├── UpdateTodo.js                  # PUT  /api/UpdateTodo
│   │   └── DeleteTodo.js                  # DELETE /api/DeleteTodo
│   └── package.json
├── docs/
│   ├── architecture.png                   # Architecture diagram
│   ├── demo.gif                           # App demo recording
│   └── tutorial.md                        # Full project tutorial
├── .gitignore
└── README.md
```

---

## 🚀 How to Deploy

### Prerequisites
- Azure CLI installed and logged in
- Azure Functions Core Tools v4
- Node.js v18+

### Steps

**1. Clone the repo**
```bash
git clone https://github.com/emmaalione6-ui/azure-serverless-todo.git
cd azure-serverless-todo/todo-api
npm install
```

**2. Create Azure resources**
```bash
az group create --name rg-serverless-todo --location eastus2

az cosmosdb create \
  --name cosmos-todo-emmaali50 \
  --resource-group rg-serverless-todo \
  --kind GlobalDocumentDB \
  --capabilities EnableServerless \
  --locations regionName=eastus2 failoverPriority=0

az cosmosdb sql database create \
  --account-name cosmos-todo-emmaali50 \
  --resource-group rg-serverless-todo \
  --name TodoDB

az cosmosdb sql container create \
  --account-name cosmos-todo-emmaali50 \
  --resource-group rg-serverless-todo \
  --database-name TodoDB \
  --name Items \
  --partition-key-path "/userId"
```

**3. Deploy the Function App**
```bash
func azure functionapp publish func-todo-api-emmaali50
```

**4. Open the frontend**

Open `frontend/index.html` in a browser, or deploy it to Azure Static Web Apps via the GitHub Actions workflow.

---

## 📚 What I Learned

- **Cosmos DB partition key design** — I chose `/userId` as the partition key so all todos for a user are co-located, making queries fast and cheap without cross-partition overhead.
- **Serverless cold starts** — The first HTTP call after inactivity takes 2–3s because Azure spins up a new container. I documented this in the live demo note above.
- **CORS in Azure Functions** — Learned that CORS must be configured both in the Function App settings AND in the code; misconfiguring one silently breaks cross-origin requests.
- **GitHub Actions for CI/CD** — Azure Static Web Apps auto-generates a workflow file on creation. Every push to `main` triggers a deploy with zero manual steps.
- **App Settings vs local.settings.json** — Secrets live in Azure App Settings (encrypted), never in code. `local.settings.json` is for local dev only and is git-ignored.

---

## 📄 License

MIT
