import os
import sys

# Ensure backend directory is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(CURRENT_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from app.main import app  # noqa: F401

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"
    reload = os.environ.get("ENV", "development") != "production" and os.environ.get("PORT") is None
    uvicorn.run("main:app", host=host, port=port, reload=reload)
