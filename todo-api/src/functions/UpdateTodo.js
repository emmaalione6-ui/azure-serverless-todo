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

app.http('UpdateTodo', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const c = await getContainer();
      const id = request.query.id;
      const body = await request.json();
      
      if (!id) {
        return { status: 400, jsonBody: { error: 'id query parameter is required' } };
      }
      if (!body.userId) {
        return { status: 400, jsonBody: { error: 'userId is required in body' } };
      }
      
      body.id = id;
      body.updatedAt = new Date().toISOString();
      
      const { resource } = await c.item(id, body.userId).replace(body);
      context.log(`UpdateTodo: Updated todo ${id} for userId: ${body.userId}`);
      return { status: 200, jsonBody: resource };
    } catch (error) {
      context.error(`UpdateTodo error: ${error.message}`);
      return { status: 500, jsonBody: { error: error.message } };
    }
  }
});