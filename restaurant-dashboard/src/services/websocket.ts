import { startOrderAlarm, stopOrderAlarm, showBrowserNotification } from '../utils/audio';

type WebSocketCallback = (data: any) => void;

class RestaurantWebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Set<WebSocketCallback> = new Set();
  private reconnectTimeout: any = null;
  private heartbeatInterval: any = null;
  private isConnected: boolean = false;

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:8000') + `/ws/restaurant`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Restaurant Dashboard WebSocket connected.');
        this.isConnected = true;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        if (event.data === 'pong') return;
        try {
          const parsed = JSON.parse(event.data);

          // If new incoming order received: trigger 20-30s kitchen alarm & notification
          if (parsed.event === 'new_order') {
            startOrderAlarm(parsed.order?.order_id);
            showBrowserNotification(
              '🚨 New Order Received!',
              `Order #${parsed.order?.order_id || ''} for ₹${parsed.order?.total_amount || 0}`
            );
          } else if (parsed.event === 'order_status_updated' && parsed.order?.order_status !== 'PLACED') {
            stopOrderAlarm();
          }

          this.listeners.forEach((callback) => callback(parsed));
        } catch (err) {
          console.error('Failed to parse restaurant WebSocket message:', err);
        }
      };

      this.ws.onclose = () => {
        console.warn('Restaurant WebSocket closed. Reconnecting in 3s...');
        this.isConnected = false;
        this.cleanup();
        this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (error) => {
        console.error('Restaurant WebSocket error:', error);
        this.ws?.close();
      };
    } catch (e) {
      console.error('Could not initiate Restaurant WebSocket:', e);
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

  public getIsConnected() {
    return this.isConnected;
  }
}

export const restaurantWs = new RestaurantWebSocketService();
