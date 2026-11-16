import { getWsBaseUrl } from './api';

type WebSocketCallback = (data: any) => void;

class CustomerWebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Set<WebSocketCallback> = new Set();
  private reconnectTimeout: any = null;
  private heartbeatInterval: any = null;
  private clientId: string;

  constructor() {
    let savedId = localStorage.getItem('bd_customer_client_id');
    if (!savedId) {
      savedId = 'cust_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('bd_customer_client_id', savedId);
    }
    this.clientId = savedId;
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = `${getWsBaseUrl()}/ws/customer/${this.clientId}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Customer WebSocket connected.');
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        if (event.data === 'pong') return;
        try {
          const parsed = JSON.parse(event.data);
          this.listeners.forEach((callback) => callback(parsed));
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      this.ws.onclose = () => {
        console.warn('Customer WebSocket closed. Reconnecting in 3s...');
        this.cleanup();
        this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (error) => {
        console.error('Customer WebSocket error:', error);
        this.ws?.close();
      };
    } catch (e) {
      console.error('Could not initiate WebSocket:', e);
      this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private cleanup() {
    this.stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  public subscribe(callback: WebSocketCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getClientId() {
    return this.clientId;
  }
}

export const customerWs = new CustomerWebSocketService();
