import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const connections = new Map<string, WebSocket>();

serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Upgrade to WebSocket
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 426,
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const clientId = crypto.randomUUID();

  socket.onopen = () => {
    console.log(`Client ${clientId} connected`);
    connections.set(clientId, socket);
    
    socket.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to real-time friction updates',
      clientId,
    }));
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log(`Received from ${clientId}:`, data);

      // Handle different message types
      switch (data.type) {
        case 'subscribe':
          // Client subscribing to specific updates
          socket.send(JSON.stringify({
            type: 'subscribed',
            channel: data.channel,
          }));
          break;
          
        case 'ping':
          socket.send(JSON.stringify({ type: 'pong' }));
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  socket.onclose = () => {
    console.log(`Client ${clientId} disconnected`);
    connections.delete(clientId);
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error for ${clientId}:`, error);
    connections.delete(clientId);
  };

  return response;
});

// Broadcast function to send updates to all connected clients
export const broadcast = (message: any) => {
  const messageStr = JSON.stringify(message);
  connections.forEach((socket, clientId) => {
    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(messageStr);
      } catch (error) {
        console.error(`Error sending to ${clientId}:`, error);
        connections.delete(clientId);
      }
    }
  });
};
