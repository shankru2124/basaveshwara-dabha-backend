import json
import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger("basaveshwara.ws")

class WebSocketManager:
    def __init__(self):
        # Admin / staff dashboard connections
        self.restaurant_connections: Set[WebSocket] = set()
        # Customer connections keyed by user_id/session_id
        self.customer_connections: Dict[str, Set[WebSocket]] = {}
        # Global customer connections (for broad announcements like menu updates)
        self.all_customer_connections: Set[WebSocket] = set()

    async def connect_restaurant(self, websocket: WebSocket):
        await websocket.accept()
        self.restaurant_connections.add(websocket)
        logger.info(f"Restaurant connected. Total active restaurant sockets: {len(self.restaurant_connections)}")

    def disconnect_restaurant(self, websocket: WebSocket):
        self.restaurant_connections.discard(websocket)
        logger.info(f"Restaurant disconnected. Remaining: {len(self.restaurant_connections)}")

    async def connect_customer(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        if client_id not in self.customer_connections:
            self.customer_connections[client_id] = set()
        self.customer_connections[client_id].add(websocket)
        self.all_customer_connections.add(websocket)
        logger.info(f"Customer {client_id} connected. Sockets: {len(self.customer_connections[client_id])}")

    def disconnect_customer(self, websocket: WebSocket, client_id: str):
        if client_id in self.customer_connections:
            self.customer_connections[client_id].discard(websocket)
            if not self.customer_connections[client_id]:
                del self.customer_connections[client_id]
        self.all_customer_connections.discard(websocket)
        logger.info(f"Customer {client_id} disconnected.")

    async def broadcast_to_restaurant(self, message: dict):
        dead_connections = set()
        text_data = json.dumps(message, default=str)
        for connection in list(self.restaurant_connections):
            try:
                await connection.send_text(text_data)
            except Exception as e:
                logger.warning(f"Error sending to restaurant socket: {e}")
                dead_connections.add(connection)
        for dead in dead_connections:
            self.restaurant_connections.discard(dead)

    async def send_to_customer(self, client_id: str, message: dict):
        text_data = json.dumps(message, default=str)
        if client_id in self.customer_connections:
            dead_connections = set()
            for connection in list(self.customer_connections[client_id]):
                try:
                    await connection.send_text(text_data)
                except Exception as e:
                    logger.warning(f"Error sending to customer {client_id}: {e}")
                    dead_connections.add(connection)
            for dead in dead_connections:
                self.customer_connections[client_id].discard(dead)

    async def broadcast_to_all_customers(self, message: dict):
        dead_connections = set()
        text_data = json.dumps(message, default=str)
        for connection in list(self.all_customer_connections):
            try:
                await connection.send_text(text_data)
            except Exception as e:
                dead_connections.add(connection)
        for dead in dead_connections:
            self.all_customer_connections.discard(dead)

    async def broadcast_all(self, message: dict):
        await self.broadcast_to_restaurant(message)
        await self.broadcast_to_all_customers(message)

ws_manager = WebSocketManager()
