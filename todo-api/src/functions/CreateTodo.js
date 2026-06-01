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

app.http('CreateTodo', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const c = await getContainer();
      const body = await request.json();
      
      // Ensure required fields
      if (!body.userId) {
        return { status: 400, jsonBody: { error: 'userId is required' } };
      }
      if (!body.title) {
        return { status: 400, jsonBody: { error: 'title is required' } };
      }
      
      // Add default values
      body.id = body.id || `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      body.createdAt = new Date().toISOString();
      body.completed = body.completed || false;
      
      const { resource } = await c.items.create(body);
      context.log(`CreateTodo: Created todo ${resource.id} for userId: ${resource.userId}`);
      return { status: 201, jsonBody: resource };
    } catch (error) {
      context.error(`CreateTodo error: ${error.message}`);
      return { status: 500, jsonBody: { error: error.message } };
    }
  }
});