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
    console.log('req.body:', req.body);
    const bodyStr = (typeof req.body === 'string') ? req.body : JSON.stringify(req.body || {});
    const body = JSON.parse(bodyStr || '{}');
    
    // Ensure required fields
    if (!body.userId) {
      return { 
        status: 400, 
        body: JSON.stringify({ error: 'userId is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
    if (!body.title) {
      return { 
        status: 400, 
        body: JSON.stringify({ error: 'title is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
    
    // Add default values
    body.id = body.id || `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    body.createdAt = new Date().toISOString();
    body.completed = body.completed || false;
    
    const { resource } = await c.items.create(body);
    console.log(`CreateTodo: Created todo ${resource.id} for userId: ${resource.userId}`);
    return { 
      status: 201, 
      body: JSON.stringify(resource),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.log(`CreateTodo error: ${error.message}`);
    return { 
      status: 500, 
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};