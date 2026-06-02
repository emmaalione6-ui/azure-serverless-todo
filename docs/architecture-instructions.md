# Architecture Diagram Instructions

## How to Create `architecture.png`

Follow these steps to create the architecture diagram for this project using [draw.io](https://app.diagrams.net) (free, no account needed):

1. Go to **https://app.diagrams.net** and click **Create New Diagram → Blank**.
2. Using the search box on the left panel, add these shapes:
   - **Browser / User**
   - **Azure Static Web Apps**
   - **Azure Functions**
   - **Azure Cosmos DB**
3. Connect them with arrows in this order:
   ```
   Browser → Static Web App → Azure Functions → Cosmos DB
   ```
4. Add a label on each arrow showing what flows:
   - `Browser → Static Web App` : *HTTP — loads HTML/JS*
   - `Static Web App → Azure Functions` : *HTTP GET/POST/PUT/DELETE*
   - `Azure Functions → Cosmos DB` : *NoSQL read/write query*
5. Click **File → Export As → PNG** and save as `docs/architecture.png`.
6. Commit and push the file:
   ```bash
   git add docs/architecture.png
   git commit -m "Add architecture diagram"
   git push origin main
   ```

## How to Create `demo.gif`

1. Download **ScreenToGif** (Windows, free) from https://www.screentogif.com
   - macOS alternative: **Kap** from https://getkap.co
2. Open your live Static Web App URL in the browser.
3. Record a **15–20 second clip** showing:
   - Page loading
   - Adding a todo item
   - The item appearing in the list
   - Marking it complete / deleting it
4. Save as `docs/demo.gif` (keep under **5MB** — reduce frame rate if needed).
5. Commit and push:
   ```bash
   git add docs/demo.gif
   git commit -m "Add app demo GIF"
   git push origin main
   ```
