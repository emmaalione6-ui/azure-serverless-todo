const { CosmosClient } = require("@azure/cosmos");
const { HttpRequest } = require("@azure/functions");

let container;

async function getContainer() {
  if (!container) {
    if (!process.env.COSMOS_CONNECTION_STRING) {
      throw new Error('COSMOS_CONNECTION_STRING environment variable is not set');
    }
    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    container = client.database("TodoDB").container("Items");
  }
  return container;
}

module.exports = async function(request, context) {
  try {
    const c = await getContainer();
    const req = request.req;
    const url = new URL(req.url, 'http://localhost');
    const userId = url.searchParams.get('userId') || 'default';
    
    const { resources } = await c.items
      .query({
        query: "SELECT * FROM c WHERE c.userId = @userId",
        parameters: [{ name: "@userId", value: userId }]
      })
      .fetchAll();
    
    console.log(`GetTodos: Retrieved ${resources.length} items for userId: ${userId}`);
    return { 
      status: 200, 
      body: JSON.stringify(resources),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.log(`GetTodos error: ${error.message}`);
    return { 
      status: 500, 
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};