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
    const bodyStr = (typeof req.body === 'string') ? req.body : JSON.stringify(req.body || {});
    const body = JSON.parse(bodyStr || '{}');
    
    if (!id) {
      return { 
        status: 400, 
        body: JSON.stringify({ error: 'id query parameter is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
    if (!body.userId) {
      return { 
        status: 400, 
        body: JSON.stringify({ error: 'userId is required in body' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
    
    body.id = id;
    body.updatedAt = new Date().toISOString();
    
    const { resource } = await c.item(id, body.userId).replace(body);
    console.log(`UpdateTodo: Updated todo ${id} for userId: ${body.userId}`);
    return { 
      status: 200, 
      body: JSON.stringify(resource),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.log(`UpdateTodo error: ${error.message}`);
    return { 
      status: 500, 
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};