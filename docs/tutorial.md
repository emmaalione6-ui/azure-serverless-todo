

**AZURE PORTFOLIO PROJECTS**

*Step-by-Step Build Tutorials for AZ-104 Certified Professionals*

Three production-grade projects to build and document on GitHub

| COLOUR KEY |  |  |  |
| :---: | ----- | ----- | ----- |
| **📟 CLI** Your terminal | **🌐 PORTAL** Browser / portal.azure.com | **💻 LOCAL** Your machine / VS Code | **🖥️ ON VM** Inside Azure VM via SSH |

**PROJECT 1**   |   **Serverless Todo Application**

| Difficulty ⭐⭐ Intermediate | Estimated Time 3–4 hours | Estimated Cost \~$0 (free tier) | GitHub Repo Name azure-serverless-todo |
| :---- | :---- | :---- | :---- |

**Azure Services Used**

| Azure Functions | Serverless backend — runs your API code only when called, billed per execution. |
| :---- | :---- |
| **Cosmos DB (Serverless)** | NoSQL database to store todo items. Serverless mode \= pay only per request. |
| **Azure Static Web Apps** | Hosts your HTML/JS frontend for free with automatic GitHub Actions deployment. |
| **App Settings** | Stores the Cosmos DB connection string securely — never in your code. |

────────────────────────────────────────────────────────────────────────────────

|  | PHASE 1 — ENVIRONMENT SETUP |
| :---- | :---- |

| 01 | Log in to Azure and create a Resource Group |
| ----- | :---- |
|  |  **📟  CLI — Run in your terminal** Open your terminal and run the login command. A browser window will open — sign in with your Microsoft account. az login After login succeeds, create the resource group that will hold all project resources: az group create \\   \--name rg-serverless-todo \\   \--location eastus2 *ℹ  You should see a JSON response with "provisioningState": "Succeeded" when the resource group is created.*  |

| 02 | Install required tools on your local machine |
| ----- | :---- |
|  |  **💻  LOCAL — Run on your local machine / VS Code** Install Azure CLI and Azure Functions Core Tools. Run in your terminal: \# macOS brew install azure-cli npm install \-g azure-functions-core-tools@4 \--unsafe-perm true \# Windows — run PowerShell as Administrator winget install Microsoft.AzureCLI npm install \-g azure-functions-core-tools@4 \--unsafe-perm true \# Verify installations az \--version       \# expects: 2.x.x func \--version     \# expects: 4.x.x node \--version     \# expects: 18.x or 20.x Install the VS Code Azure Functions extension: code \--install-extension ms-azuretools.vscode-azurefunctions  |

────────────────────────────────────────────────────────────────────────────────

|  | PHASE 2 — BACKEND: COSMOS DB \+ AZURE FUNCTIONS |
| :---- | :---- |

| 03 | Create a Cosmos DB account and container |
| ----- | :---- |
|  |  **📟  CLI — Run in your terminal** Replace \[unique\] with your initials \+ a number (e.g. jd42). Cosmos DB account names must be globally unique. \# Create the Cosmos DB account (serverless \= cheapest) az cosmosdb create \\   \--name cosmos-todo-\[unique\] \\   \--resource-group rg-serverless-todo \\   \--kind GlobalDocumentDB \\   \--capabilities EnableServerless \\   \--locations regionName="eastus2" failoverPriority=0 \# Create the database inside the account az cosmosdb sql database create \\   \--account-name cosmos-todo-\[unique\] \\   \--resource-group rg-serverless-todo \\   \--name TodoDB \# Create the container (like a table in SQL) az cosmosdb sql container create \\   \--account-name cosmos-todo-\[unique\] \\   \--resource-group rg-serverless-todo \\   \--database-name TodoDB \\   \--name Items \\   \--partition-key-path "/userId" *ℹ  The first command takes 3–5 minutes. Wait for it to complete before running the next two.*  |

| 04 | Create the Azure Functions project on your local machine |
| ----- | :---- |
|  |  **💻  LOCAL — Run on your local machine / VS Code** Create a new folder and scaffold the project with four HTTP-triggered functions: \# Create project folder and move into it mkdir todo-api && cd todo-api \# Initialise as a JavaScript Azure Functions project func init \--worker-runtime node \--language javascript \# Create four API functions func new \--name GetTodos    \--template "HTTP trigger" \--authlevel anonymous func new \--name CreateTodo  \--template "HTTP trigger" \--authlevel anonymous func new \--name UpdateTodo  \--template "HTTP trigger" \--authlevel anonymous func new \--name DeleteTodo  \--template "HTTP trigger" \--authlevel anonymous \# Install the Cosmos DB SDK npm install @azure/cosmos **💻  LOCAL — Run on your local machine / VS Code** Open GetTodos/index.js in VS Code and replace its contents with this code: const { CosmosClient } \= require("@azure/cosmos"); const client \= new CosmosClient(process.env.COSMOS\_CONNECTION\_STRING); const container \= client.database("TodoDB").container("Items"); module.exports \= async function (context, req) {   const userId \= req.query.userId || "default";   const { resources } \= await container.items     .query({       query: "SELECT \* FROM c WHERE c.userId \= @userId",       parameters: \[{ name: "@userId", value: userId }\]     })     .fetchAll();   context.res \= { status: 200, body: resources }; }; *ℹ  Repeat the same pattern for CreateTodo (container.items.create()), UpdateTodo (container.item(id).replace()), and DeleteTodo (container.item(id).delete()).*  |

| 05 | Create the Function App in Azure and deploy your code |
| ----- | :---- |
|  |  **📟  CLI — Run in your terminal** Step 1 of 4 — Create a Storage Account (required by Azure Functions): az storage account create \\   \--name sttodofunc\[unique\] \\   \--resource-group rg-serverless-todo \\   \--sku Standard\_LRS Step 2 of 4 — Create the Function App on a Consumption (pay-per-use) plan: az functionapp create \\   \--name func-todo-api-\[unique\] \\   \--resource-group rg-serverless-todo \\   \--consumption-plan-location eastus2 \\   \--runtime node \\   \--runtime-version 18 \\   \--functions-version 4 \\   \--storage-account sttodofunc\[unique\] Step 3 of 4 — Get your Cosmos DB connection string and set it as an App Setting: COSMOS\_CONN=$(az cosmosdb keys list \\   \--name cosmos-todo-\[unique\] \\   \--resource-group rg-serverless-todo \\   \--type connection-strings \\   \--query 'connectionStrings\[0\].connectionString' \-o tsv) az functionapp config appsettings set \\   \--name func-todo-api-\[unique\] \\   \--resource-group rg-serverless-todo \\   \--settings COSMOS\_CONNECTION\_STRING="$COSMOS\_CONN" Step 4 of 4 — Deploy your local code to Azure: func azure functionapp publish func-todo-api-\[unique\] **⚠  Never commit connection strings to GitHub. They live in App Settings only. Add local.settings.json to your .gitignore file right now.**  |

| 06 | Enable CORS so your frontend can call the API |
| ----- | :---- |
|  |  **🌐  PORTAL — Do this in your browser at portal.azure.com** Perform the following steps in your browser at portal.azure.com: In the top search bar, type Function App and click it. Click on your function app: func-todo-api-\[unique\]. In the left sidebar, scroll down and click CORS (under the API section). In the "Allowed Origins" box, type \* (asterisk) for now to allow all origins. Click Save at the top of the page. After deploying the Static Web App in Phase 3, come back here and replace \* with your actual Static Web App URL.  |

────────────────────────────────────────────────────────────────────────────────

|  | PHASE 3 — FRONTEND: STATIC WEB APPS |
| :---- | :---- |

| 07 | Create the frontend HTML file on your local machine |
| ----- | :---- |
|  |  **💻  LOCAL — Run on your local machine / VS Code** Navigate back from the todo-api folder and create a frontend folder: cd .. mkdir frontend && cd frontend Create a file called index.html. Replace \[unique\] with your function app name: \<\!DOCTYPE html\> \<html\>\<head\>\<title\>Azure Todo\</title\>\</head\> \<body\>   \<h1\>My Todos\</h1\>   \<input id="newtodo" placeholder="New todo..." /\>   \<button onclick="addTodo()"\>Add\</button\>   \<ul id="list"\>\</ul\>   \<script\>     const API \= "https://func-todo-api-\[unique\].azurewebsites.net/api";     const USER \= "demo";     async function loadTodos() {       const res \= await fetch(\`${API}/GetTodos?userId=${USER}\`);       const todos \= await res.json();       const ul \= document.getElementById("list");       ul.innerHTML \= "";       todos.forEach(t \=\> {         const li \= document.createElement("li");         li.textContent \= t.title;         ul.appendChild(li);       });     }     async function addTodo() {       const title \= document.getElementById("newtodo").value;       await fetch(\`${API}/CreateTodo\`, {         method: "POST",         headers: { "Content-Type": "application/json" },         body: JSON.stringify({ title, userId: USER, id: Date.now().toString() })       });       loadTodos();     }     loadTodos();   \</script\> \</body\>\</html\>  |

| 08 | Push your code to GitHub |
| ----- | :---- |
|  |  **💻  LOCAL — Run on your local machine / VS Code** Go to github.com, create a new repository called azure-serverless-todo, then run: cd ..   \# go to root project folder (above todo-api and frontend) git init echo "local.settings.json" \>\> .gitignore echo "node\_modules/" \>\> .gitignore git add . git commit \-m "Initial commit: Azure serverless todo app" git remote add origin https://github.com/YOUR-USERNAME/azure-serverless-todo.git git push \-u origin main  |

| 09 | Deploy the frontend with Azure Static Web Apps |
| ----- | :---- |
|  |  **🌐  PORTAL — Do this in your browser at portal.azure.com** Perform the following steps in your browser at portal.azure.com: In the top search bar, type Static Web Apps and click it. Click \+ Create. Fill in the form: Resource group \= rg-serverless-todo | Name \= swa-todo-\[unique\] | Plan type \= Free | Region \= East US 2\. Under "Deployment details", select GitHub and click Sign in with GitHub. Select your repository: azure-serverless-todo and branch: main. Under "Build details", set App location to /frontend and leave Output location blank. Click Review \+ create → Create. Azure will add a GitHub Actions workflow file to your repo automatically. Every future git push will trigger a new deployment. After creation, copy the Static Web App URL → go back to your Function App CORS settings (Step 06\) and replace \* with this URL.  |

────────────────────────────────────────────────────────────────────────────────

|  | PHASE 4 — GITHUB DOCUMENTATION |
| :---- | :---- |

| 10 | Structure your repo and write your README |
| ----- | :---- |
|  |  **💻  LOCAL — Run on your local machine / VS Code** Your final folder structure should look like this: azure-serverless-todo/ ├── todo-api/ │   ├── GetTodos/index.js │   ├── CreateTodo/index.js │   ├── UpdateTodo/index.js │   ├── DeleteTodo/index.js │   └── package.json ├── frontend/ │   └── index.html ├── docs/ │   ├── architecture.png   ← draw on Excalidraw, export as PNG │   └── demo.gif           ← screen record the working app ├── .gitignore └── README.md Your README must include: what the project does, an architecture diagram, the Azure services used and why, how to deploy it yourself, and what you learned. This is what employers actually read. *ℹ  Use the free tool Excalidraw (excalidraw.com) to draw your architecture diagram and save it as docs/architecture.png.*  |

**PROJECT 2**   |   **Multi-Region High Availability App**

| Difficulty ⭐⭐⭐ Advanced | Estimated Time 5–6 hours | Estimated Cost \~$5–10 (delete after) | GitHub Repo Name azure-multi-region-ha |
| :---- | :---- | :---- | :---- |

────────────────────────────────────────────────────────────────────────────────

|  | PHASE 1 — INFRASTRUCTURE IN TWO REGIONS |
| :---- | :---- |

| 01 | Create two resource groups in two different Azure regions |
| ----- | :---- |
|  |  **📟  CLI — Run in your terminal** This project deploys the same application in two Azure regions. If one region goes down, Traffic Manager automatically routes users to the healthy region. \# Primary region (East US) az group create \--name rg-ha-primary \--location eastus \# Secondary region (West Europe — geographically separated) az group create \--name rg-ha-secondary \--location westeurope *ℹ  Two separate resource groups \= two separate billing and management boundaries. This mirrors real enterprise architecture.*  |

| 02 | Deploy App Service Plans and Web Apps in both regions |
| ----- | :---- |
|  |  **📟  CLI — Run in your terminal** Create an App Service Plan and Web App in each region. Use the S1 tier — required for Traffic Manager integration. \# \--- PRIMARY REGION (East US) \--- az appservice plan create \\   \--name asp-ha-primary \\   \--resource-group rg-ha-primary \\   \--location eastus \\   \--sku S1 az webapp create \\   \--name webapp-ha-primary-\[unique\] \\   \--resource-group rg-ha-primary \\   \--plan asp-ha-primary \\   \--runtime "NODE|18-lts" \# \--- SECONDARY REGION (West Europe) \--- az appservice plan create \\   \--name asp-ha-secondary \\   \--resource-group rg-ha-secondary \\   \--location westeurope \\   \--sku S1 az webapp create \\   \--name webapp-ha-secondary-\[unique\] \\   \--resource-group rg-ha-secondary \\   \--plan asp-ha-secondary \\   \--runtime "NODE|18-lts" **⚠  S1 plan costs money per hour. Run this project, take your screenshots, then delete everything the same day.**  |

| 03 | Deploy your app code to both web apps |
| ----- | :---- |
|  |  **💻  LOCAL — Run on your local machine / VS Code** Create a minimal Node.js test app. In a new folder called ha-app/, create app.js with this content: const http \= require("http"); const os \= require("os"); http.createServer((req, res) \=\> {   res.end(\`Hello from region: ${process.env.REGION || "unknown"} | Host: ${os.hostname()}\`); }).listen(process.env.PORT || 3000); **📟  CLI — Run in your terminal** Zip and deploy to both web apps, then set a REGION environment variable so you can see which region responds: \# Zip your app folder cd ha-app && zip \-r app.zip . \# Deploy to primary and set region label az webapp deployment source config-zip \\   \--name webapp-ha-primary-\[unique\] \\   \--resource-group rg-ha-primary \\   \--src app.zip az webapp config appsettings set \\   \--name webapp-ha-primary-\[unique\] \\   \--resource-group rg-ha-primary \\   \--settings REGION="East US" \# Deploy same zip to secondary az webapp deployment source config-zip \\   \--name webapp-ha-secondary-\[unique\] \\   \--resource-group rg-ha-secondary \\   \--src app.zip az webapp config appsettings set \\   \--name webapp-ha-secondary-\[unique\] \\   \--resource-group rg-ha-secondary \\   \--settings REGION="West Europe"  |

────────────────────────────────────────────────────────────────────────────────

|  | PHASE 2 — TRAFFIC MANAGER SETUP |
| :---- | :---- |

| 04 | Create Traffic Manager profile with Priority routing |
| ----- | :---- |
|  |  **📟  CLI — Run in your terminal** Azure Traffic Manager is a DNS-based load balancer. With Priority routing, all traffic goes to the primary endpoint. If it fails health checks, traffic automatically shifts to the secondary. \# Create the Traffic Manager profile az network traffic-manager profile create \\   \--name tm-ha-app \\   \--resource-group rg-ha-primary \\   \--routing-method Priority \\   \--unique-dns-name tm-ha-app-\[unique\] \\   \--monitor-protocol HTTP \\   \--monitor-port 80 \\   \--monitor-path "/" \# Add primary endpoint (priority 1 \= traffic goes here first) az network traffic-manager endpoint create \\   \--name endpoint-primary \\   \--profile-name tm-ha-app \\   \--resource-group rg-ha-primary \\   \--type azureEndpoints \\   \--priority 1 \\   \--target-resource-id $(az webapp show \\     \--name webapp-ha-primary-\[unique\] \\     \--resource-group rg-ha-primary \--query id \-o tsv) \# Add secondary endpoint (priority 2 \= failover target) az network traffic-manager endpoint create \\   \--name endpoint-secondary \\   \--profile-name tm-ha-app \\   \--resource-group rg-ha-primary \\   \--type azureEndpoints \\   \--priority 2 \\   \--target-resource-id $(az webapp show \\     \--name webapp-ha-secondary-\[unique\] \\     \--resource-group rg-ha-secondary \--query id \-o tsv) *ℹ  Your app is now accessible at: tm-ha-app-\[unique\].trafficmanager.net — open this URL in your browser to verify it shows "East US".*  |

| 05 | Test the failover — simulate primary region going down |
| ----- | :---- |
|  |  **🌐  PORTAL — Do this in your browser at portal.azure.com** Open two browser tabs side by side and follow these steps: Tab 1: Open your Traffic Manager URL: tm-ha-app-\[unique\].trafficmanager.net — it should respond with "East US". Tab 2: Go to portal.azure.com → search App Services → click webapp-ha-primary-\[unique\] → click Stop at the top of the page. Wait 60–90 seconds (Traffic Manager health check interval). Refresh Tab 1 — it should now respond with "West Europe". This is automatic failover. Take a screenshot of this. This is the most important evidence for your portfolio. **📟  CLI — Run in your terminal** Alternatively, stop the primary app from the terminal: az webapp stop \\   \--name webapp-ha-primary-\[unique\] \\   \--resource-group rg-ha-primary  |

────────────────────────────────────────────────────────────────────────────────

|  | PHASE 3 — AZURE SQL WITH GEO-REPLICATION |
| :---- | :---- |

| 06 | Create Azure SQL Server and database in primary region |
| ----- | :---- |
|  |  **📟  CLI — Run in your terminal** \# Create SQL Server in primary region az sql server create \\   \--name sql-ha-primary-\[unique\] \\   \--resource-group rg-ha-primary \\   \--location eastus \\   \--admin-user sqladmin \\   \--admin-password "SecureP@ssw0rd1\!" \# Create the database az sql db create \\   \--server sql-ha-primary-\[unique\] \\   \--resource-group rg-ha-primary \\   \--name appdb \\   \--service-objective S1 \# Allow Azure services to connect az sql server firewall-rule create \\   \--server sql-ha-primary-\[unique\] \\   \--resource-group rg-ha-primary \\   \--name AllowAzureServices \\   \--start-ip-address 0.0.0.0 \\   \--end-ip-address 0.0.0.0  |

| 07 | Create secondary SQL Server and enable geo-replication |
| ----- | :---- |
|  |  **📟  CLI — Run in your terminal** \# Create secondary SQL Server in West Europe az sql server create \\   \--name sql-ha-secondary-\[unique\] \\   \--resource-group rg-ha-secondary \\   \--location westeurope \\   \--admin-user sqladmin \\   \--admin-password "SecureP@ssw0rd1\!" \# Create the geo-replica (links the two servers) az sql db replica create \\   \--name appdb \\   \--resource-group rg-ha-primary \\   \--server sql-ha-primary-\[unique\] \\   \--partner-resource-group rg-ha-secondary \\   \--partner-server sql-ha-secondary-\[unique\] **🌐  PORTAL — Do this in your browser at portal.azure.com** Verify geo-replication is active and take a portfolio screenshot: Go to portal.azure.com → search SQL databases → click appdb (on sql-ha-primary-\[unique\]). In the left sidebar, click Geo-Replication. You should see a world map with a dot in East US (primary) and West Europe (replica). Take a screenshot of this map — it is powerful evidence for your portfolio. **⚠  Delete these SQL servers when you are done. Run: az group delete \--name rg-ha-primary \--yes and az group delete \--name rg-ha-secondary \--yes**  |

────────────────────────────────────────────────────────────────────────────────

|  | PHASE 4 — MONITORING \+ GITHUB DOCUMENTATION |
| :---- | :---- |

| 08 | Create an Azure Monitor alert for high response time |
| ----- | :---- |
|  |  **🌐  PORTAL — Do this in your browser at portal.azure.com** Perform the following steps in your browser at portal.azure.com: Search Monitor in the top bar and click it. In the left sidebar, click Alerts → \+ Create → Alert rule. Under "Scope", click Select resource → choose your primary web app → click Done. Under "Condition", click Add condition → search Http Response Time → select it. Set: Operator \= Greater than | Threshold \= 2 (seconds) | Aggregation \= Average. Click Next: Actions → Create action group → Name: ag-ha-alerts → Add email notification with your email address. Click Next: Details → Name the rule: alert-high-response-time → Click Review \+ create.  |

| 09 | Structure your repo and write the README |
| ----- | :---- |
|  |  **💻  LOCAL — Run on your local machine / VS Code** Your final folder structure: azure-multi-region-ha/ ├── ha-app/ │   └── app.js ├── infra/ │   ├── deploy-primary.sh │   ├── deploy-secondary.sh │   └── traffic-manager.sh ├── docs/ │   ├── architecture.png │   ├── failover-test.png   ← screenshot during failover │   └── geo-replication.png ← screenshot of SQL world map └── README.md Key README sections: how high availability works in this project, SLA calculation (99.95% per region \= \~99.9999% combined), failover test results with timestamps, and cost breakdown.  |

**PROJECT 3**   |   **Secure Monitoring Pipeline**

| Difficulty ⭐⭐⭐ Advanced | Estimated Time 4–5 hours | Estimated Cost \~$2–5 (delete after) | GitHub Repo Name azure-secure-monitoring |
| :---- | :---- | :---- | :---- |

────────────────────────────────────────────────────────────────────────────────

|  | PHASE 1 — KEY VAULT \+ MANAGED IDENTITY |
| :---- | :---- |

| 01 | Create the resource group and Key Vault, then store a secret |
| ----- | :---- |
|  |  **📟  CLI — Run in your terminal** Key Vault is Azure's centralized secret store. No more hardcoded passwords anywhere in your code. \# Create the resource group az group create \\   \--name rg-secure-pipeline \\   \--location eastus \# Create the Key Vault az keyvault create \\   \--name kv-secure-\[unique\] \\   \--resource-group rg-secure-pipeline \\   \--location eastus \\   \--sku standard \\   \--enable-rbac-authorization true \# Store a secret (simulating a database password) az keyvault secret set \\   \--vault-name kv-secure-\[unique\] \\   \--name "DbPassword" \\   \--value "MySecretDatabaseP@ss\!" **🌐  PORTAL — Do this in your browser at portal.azure.com** Enable diagnostic logging on Key Vault so every secret access is audited. Do this AFTER completing Step 05 (Log Analytics Workspace): Go to portal.azure.com → search Key vaults → click kv-secure-\[unique\]. In the left sidebar, click Diagnostic settings → \+ Add diagnostic setting. Name it: kv-audit-logs. Under Logs, tick the box for AuditEvent. Under Destination, tick Send to Log Analytics workspace → select law-secure-pipeline. Click Save.  |

| 02 | Create a Linux VM with a System-Assigned Managed Identity |
| ----- | :---- |
|  |  **📟  CLI — Run in your terminal** A Managed Identity lets the VM authenticate to Key Vault without storing any credentials. Azure manages the identity token automatically. \# Create the VM with managed identity enabled az vm create \\   \--name vm-secure-agent \\   \--resource-group rg-secure-pipeline \\   \--image Ubuntu2204 \\   \--size Standard\_B1s \\   \--admin-username azureuser \\   \--generate-ssh-keys \\   \--assign-identity \# Note the publicIpAddress in the output — you need it to SSH in Step 04 *ℹ  The \--generate-ssh-keys flag saves your SSH key to \~/.ssh/id\_rsa on your local machine automatically.*  |

| 03 | Grant the VM identity permission to read Key Vault secrets |
| ----- | :---- |
|  |  **📟  CLI — Run in your terminal** This is the zero-credential pattern — no passwords are stored anywhere. The VM authenticates automatically using its identity token. \# Get the VM's identity principal ID PRINCIPAL\_ID=$(az vm show \\   \--name vm-secure-agent \\   \--resource-group rg-secure-pipeline \\   \--query identity.principalId \-o tsv) \# Get the Key Vault resource ID KV\_ID=$(az keyvault show \\   \--name kv-secure-\[unique\] \\   \--resource-group rg-secure-pipeline \\   \--query id \-o tsv) \# Grant the VM "Key Vault Secrets User" role az role assignment create \\   \--assignee $PRINCIPAL\_ID \\   \--role "Key Vault Secrets User" \\   \--scope $KV\_ID *ℹ  Role assignment takes 1–2 minutes to propagate before you can test it in Step 04\.*  |

| 04 | SSH into the VM and test reading a secret with no credentials |
| ----- | :---- |
|  |  **💻  LOCAL — Run on your local machine / VS Code** Open your local terminal and SSH into the VM: \# Replace \[VM-PUBLIC-IP\] with the IP from the Step 02 output ssh azureuser@\[VM-PUBLIC-IP\] **🖥️  ON VM — Run inside the Azure VM via SSH** You are now inside the Azure VM. Install the Azure CLI and test the managed identity: \# Install Azure CLI on the VM curl \-sL https://aka.ms/InstallAzureCLIDeb | sudo bash \# Log in using managed identity — NO username or password needed\! az login \--identity \# Read the Key Vault secret using only the VM's identity az keyvault secret show \\   \--vault-name kv-secure-\[unique\] \\   \--name DbPassword \\   \--query value \-o tsv \# You should see the secret value printed. \# Take a screenshot — this proves zero-credential pattern is working. \# Type exit to return to your local terminal.  |

────────────────────────────────────────────────────────────────────────────────

|  | PHASE 2 — CENTRALISED LOGGING WITH LOG ANALYTICS |
| :---- | :---- |

| 05 | Create a Log Analytics Workspace |
| ----- | :---- |
|  |  **📟  CLI — Run in your terminal** Run this in your LOCAL terminal (not inside the VM). Log Analytics Workspace is the central log store for all your resources. az monitor log-analytics workspace create \\   \--resource-group rg-secure-pipeline \\   \--workspace-name law-secure-pipeline \\   \--location eastus \\   \--sku PerGB2018 *ℹ  Now go back to Step 01 (PORTAL section) and link the Key Vault diagnostic settings to this workspace: law-secure-pipeline.*  |

| 06 | Connect the VM to Log Analytics to collect its logs |
| ----- | :---- |
|  |  **📟  CLI — Run in your terminal** Install the Log Analytics agent extension on the VM so its system logs and performance data are sent to your workspace: \# Get workspace ID and key WORKSPACE\_ID=$(az monitor log-analytics workspace show \\   \--resource-group rg-secure-pipeline \\   \--workspace-name law-secure-pipeline \\   \--query customerId \-o tsv) WORKSPACE\_KEY=$(az monitor log-analytics workspace get-shared-keys \\   \--resource-group rg-secure-pipeline \\   \--workspace-name law-secure-pipeline \\   \--query primarySharedKey \-o tsv) \# Install Log Analytics agent on the VM az vm extension set \\   \--resource-group rg-secure-pipeline \\   \--vm-name vm-secure-agent \\   \--name OmsAgentForLinux \\   \--publisher Microsoft.EnterpriseCloud.Monitoring \\   \--settings "{\\"workspaceId\\": \\"$WORKSPACE\_ID\\"}" \\   \--protected-settings "{\\"workspaceKey\\": \\"$WORKSPACE\_KEY\\"}" *ℹ  It takes 5–10 minutes for the first logs to flow into Log Analytics after installing the agent. Be patient before running queries in Step 07\.*  |

| 07 | Run KQL security queries in the Portal |
| ----- | :---- |
|  |  **🌐  PORTAL — Do this in your browser at portal.azure.com** Open Log Analytics and run these KQL queries. Take a screenshot of each result for your portfolio. Search Log Analytics workspaces → click law-secure-pipeline. In the left sidebar, click Logs. Close the Queries popup if it appears. Paste each query into the query box and click Run. Query 1 — All Key Vault secret accesses in the last 24 hours: AzureDiagnostics | where ResourceProvider \== "MICROSOFT.KEYVAULT" | where OperationName \== "SecretGet" | where TimeGenerated \> ago(24h) | project TimeGenerated, CallerIPAddress, ResultType | order by TimeGenerated desc Query 2 — Failed SSH login attempts on your VM: Syslog | where Facility \== "auth" | where SyslogMessage contains "Failed password" | summarize FailedAttempts \= count() by Computer, bin(TimeGenerated, 1h) | order by FailedAttempts desc Query 3 — Top 10 processes by CPU usage: Perf | where ObjectName \== "Process" and CounterName \== "% User Time" | where TimeGenerated \> ago(1h) | top 10 by CounterValue desc | project Computer, InstanceName, CounterValue  |

────────────────────────────────────────────────────────────────────────────────

|  | PHASE 3 — DEFENDER FOR CLOUD \+ MICROSOFT SENTINEL |
| :---- | :---- |

| 08 | Enable Defender for Cloud and improve your Secure Score |
| ----- | :---- |
|  |  **🌐  PORTAL — Do this in your browser at portal.azure.com** Perform the following steps in your browser at portal.azure.com: Search Microsoft Defender for Cloud in the top bar → click it. Take a screenshot of your current Secure Score (shown at the top). This is your "before" score. Click Recommendations in the left sidebar. Fix recommendation 1: "MFA should be enabled on accounts with owner permissions" → go to Azure Active Directory → enable MFA for your account. Fix recommendation 2: "Management ports should be closed on VMs" → click it → select your VM → click Fix. This enables Just-in-Time access, closing port 22 when not in use. Fix recommendation 3: "Diagnostic logs in Key Vault should be enabled" → you already did this in Step 01\. Wait 10–15 minutes → refresh the page → take a screenshot of your improved Secure Score. *ℹ  Document the before and after scores in your README. Going from e.g. 45% to 72% is a concrete, measurable result that impresses employers.*  |

| 09 | Enable Microsoft Sentinel and create a brute-force detection rule |
| ----- | :---- |
|  |  **🌐  PORTAL — Do this in your browser at portal.azure.com** Step 1 — Enable Sentinel on your workspace: Search Microsoft Sentinel → click \+ Create → click law-secure-pipeline → click Add. Wait about 1 minute for Sentinel to activate. Step 2 — Create a brute-force SSH detection rule: Inside Sentinel, click Analytics in the left sidebar. Click \+ Create → Scheduled query rule. General tab: Name \= Brute Force SSH Detected | Severity \= High | Tactics \= Credential Access. Click Next: Set rule logic. Paste the KQL query below into the Rule query box. Set: Run query every \= 5 minutes | Lookup data from the last \= 10 minutes. Click Next through remaining tabs → Review \+ create → Save. Paste this KQL query into the Rule query box: Syslog | where Facility \== "auth" | where SyslogMessage contains "Failed password for" | summarize FailCount \= count() by bin(TimeGenerated, 10m), Computer | where FailCount \>= 5 **💻  LOCAL — Run on your local machine / VS Code** Step 3 — Trigger the rule by simulating a brute-force attack. Run this from your local terminal (intentionally wrong password, 5+ times): \# Run this command 5–6 times ssh wronguser@\[VM-PUBLIC-IP\] \# When prompted for password, press Enter or type anything wrong Wait 5–10 minutes. Then in the Portal go to Sentinel → Incidents. You should see a new High severity incident. Click it and take a screenshot — this is powerful portfolio evidence.  |

────────────────────────────────────────────────────────────────────────────────

|  | PHASE 4 — GITHUB DOCUMENTATION \+ CLEANUP |
| :---- | :---- |

| 10 | Structure your repo, write the README, and delete all resources |
| ----- | :---- |
|  |  **💻  LOCAL — Run on your local machine / VS Code** Your final folder structure: azure-secure-monitoring/ ├── scripts/ │   ├── 01-keyvault.sh │   ├── 02-vm-identity.sh │   ├── 03-log-analytics.sh │   └── 04-sentinel.sh ├── kql-queries/ │   ├── keyvault-access.kql │   ├── failed-ssh.kql │   └── cpu-top10.kql ├── docs/ │   ├── architecture.png │   ├── secure-score-before.png │   ├── secure-score-after.png │   └── sentinel-incident.png └── README.md **📟  CLI — Run in your terminal** Delete all resources when done to stop billing: az group delete \--name rg-secure-pipeline \--yes \--no-wait **⚠  Always run the delete command above when you are finished documenting the project. The VM costs money every hour it is running.**  |

