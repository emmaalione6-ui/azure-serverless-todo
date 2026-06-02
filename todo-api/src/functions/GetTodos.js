const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

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

app.http('GetTodos', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const c = await getContainer();
      const userId = request.query.userId || 'default';
      
      const { resources } = await c.items
        .query({
          query: "SELECT * FROM c WHERE c.userId = @userId",
          parameters: [{ name: "@userId", value: userId }]
        })
        .fetchAll();
      
      context.log(`GetTodos: Retrieved ${resources.length} items for userId: ${userId}`);
      return { status: 200, jsonBody: resources };
    } catch (error) {
      context.error(`GetTodos error: ${error.message}`);
      return { status: 500, jsonBody: { error: error.message } };
    }
  }
});