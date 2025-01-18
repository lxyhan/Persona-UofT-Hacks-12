// In your websocket.js server
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8081 });

let connections = new Set(); // Keep track of connections

wss.on('connection', function connection(ws) {
  connections.add(ws);
  console.log(`Client connected! Total connections: ${connections.size}`);

  ws.on('message', function incoming(message) {
    console.log('🔵 Server received:', message.toString());
    
    // Log before broadcasting
    console.log(`Broadcasting to ${connections.size} clients`);
    
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocketServer.OPEN) {
        console.log('Sending to a client');
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    connections.delete(ws);
    console.log(`Client disconnected. Remaining connections: ${connections.size}`);
  });
});

console.log('WebSocket server starting on port 8081');