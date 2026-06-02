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

module.exports = async function(request, context) {
  try {
    const c = await getContainer();
    const req = request.req;
    const url = new URL(req.url, 'http://localhost');
    const id = url.searchParams.get('id');
    const userId = url.searchParams.get('userId');
    
    if (!id) {
      return { 
        status: 400, 
        body: JSON.stringify({ error: 'id query parameter is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
    if (!userId) {
      return { 
        status: 400, 
        body: JSON.stringify({ error: 'userId query parameter is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
    
    await c.item(id, userId).delete();
    console.log(`DeleteTodo: Deleted todo ${id} for userId: ${userId}`);
    return { status: 204 };
  } catch (error) {
    console.log(`DeleteTodo error: ${error.message}`);
    return { 
      status: 500, 
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};