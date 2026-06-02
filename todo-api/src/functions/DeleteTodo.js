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

app.http('DeleteTodo', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const c = await getContainer();
      const id = request.query.id;
      const userId = request.query.userId;
      
      if (!id) {
        return { status: 400, jsonBody: { error: 'id query parameter is required' } };
      }
      if (!userId) {
        return { status: 400, jsonBody: { error: 'userId query parameter is required' } };
      }
      
      await c.item(id, userId).delete();
      context.log(`DeleteTodo: Deleted todo ${id} for userId: ${userId}`);
      return { status: 204 };
    } catch (error) {
      context.error(`DeleteTodo error: ${error.message}`);
      return { status: 500, jsonBody: { error: error.message } };
    }
  }
});