// WebSocket service for real-time chat
class ChatWebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.messageHandlers = [];
    this.typingHandlers = [];
    this.connectionHandlers = [];
  }

  // Connect to WebSocket
  connect(username, coupleId) {
    if (this.ws && this.isConnected) {
      return; // Already connected
    }

    const wsUrl = `ws://localhost:8080/ws?username=${encodeURIComponent(username)}&couple_id=${encodeURIComponent(coupleId)}`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.notifyConnectionHandlers('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.notifyConnectionHandlers('disconnected');
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (!this.isConnected) {
          this.connect(username, coupleId);
        }
      }, 3000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.notifyConnectionHandlers('error', error);
    };
  }

  // Handle incoming messages
  handleMessage(message) {
    switch (message.type) {
      case 'chat_message':
        this.notifyMessageHandlers(message);
        break;
      case 'typing_start':
        this.notifyTypingHandlers(message.sender, true);
        break;
      case 'typing_stop':
        this.notifyTypingHandlers(message.sender, false);
        break;
      case 'user_joined':
        console.log(`${message.sender} joined the chat`);
        break;
      case 'user_left':
        console.log(`${message.sender} left the chat`);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  // Send chat message
  sendMessage(content) {
    if (!this.isConnected || !this.ws) {
      console.error('WebSocket not connected');
      return false;
    }

    const message = {
      type: 'chat_message',
      content: content
    };

    this.ws.send(JSON.stringify(message));
    return true;
  }

  // Send typing indicator
  sendTypingStart() {
    if (!this.isConnected || !this.ws) return;

    const message = {
      type: 'typing_start'
    };

    this.ws.send(JSON.stringify(message));
  }

  sendTypingStop() {
    if (!this.isConnected || !this.ws) return;

    const message = {
      type: 'typing_stop'
    };

    this.ws.send(JSON.stringify(message));
  }

  // Event handlers
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  onTyping(handler) {
    this.typingHandlers.push(handler);
  }

  onConnection(handler) {
    this.connectionHandlers.push(handler);
  }

  // Notify handlers
  notifyMessageHandlers(message) {
    this.messageHandlers.forEach(handler => handler(message));
  }

  notifyTypingHandlers(sender, isTyping) {
    this.typingHandlers.forEach(handler => handler(sender, isTyping));
  }

  notifyConnectionHandlers(status, error = null) {
    this.connectionHandlers.forEach(handler => handler(status, error));
  }

  // Disconnect
  disconnect() {
    if (this.ws) {
      this.isConnected = false;
      this.ws.close();
      this.ws = null;
    }
  }

  // Remove event handlers
  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  removeTypingHandler(handler) {
    this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
  }

  removeConnectionHandler(handler) {
    this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
  }
}

// Create singleton instance
const chatWebSocket = new ChatWebSocketService();
export default chatWebSocket;