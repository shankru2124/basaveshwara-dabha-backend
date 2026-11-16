import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import db_manager
from app.seed_data import seed_initial_data
from app.websocket_manager import ws_manager

from app.routers import auth, menu, cart, orders, restaurant, coupons, analytics, upload

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("basaveshwara.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Basaveshwara Dabha API server...")
    await db_manager.connect()
    await seed_initial_data()
    yield
    # Shutdown
    logger.info("Shutting down Basaveshwara Dabha API server...")
    await db_manager.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Unified Backend API and Real-Time WebSocket Server for Basaveshwara Dabha Food Ordering Platform",
    lifespan=lifespan
)

# CORS Middleware - Support all local, cloud and PWA mobile origins dynamically
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?:\/\/.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploaded photos
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Include Routers under /api
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(menu.router, prefix=settings.API_PREFIX)
app.include_router(cart.router, prefix=settings.API_PREFIX)
app.include_router(orders.router, prefix=settings.API_PREFIX)
app.include_router(restaurant.router, prefix=settings.API_PREFIX)
app.include_router(coupons.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(upload.router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    return {
        "restaurant": "Basaveshwara Dabha",
        "status": "Online & Serving Authentic Pure Vegetarian Food",
        "docs": "/docs",
        "version": settings.VERSION
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "is_mock_db": db_manager.is_mock,
        "database": "connected"
    }

# ==================== WEBSOCKET ENDPOINTS ====================

@app.websocket("/ws/restaurant")
async def websocket_restaurant(websocket: WebSocket):
    await ws_manager.connect_restaurant(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle heartbeat ping
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect_restaurant(websocket)
    except Exception as e:
        logger.warning(f"Restaurant websocket error: {e}")
        ws_manager.disconnect_restaurant(websocket)

@app.websocket("/ws/customer/{client_id}")
async def websocket_customer(websocket: WebSocket, client_id: str):
    await ws_manager.connect_customer(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect_customer(websocket, client_id)
    except Exception as e:
        logger.warning(f"Customer {client_id} websocket error: {e}")
        ws_manager.disconnect_customer(websocket, client_id)
