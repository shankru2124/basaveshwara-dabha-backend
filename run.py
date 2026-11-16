import os
import sys

# Ensure both root and backend directories are in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(CURRENT_DIR, "backend")

if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"
    reload = os.environ.get("ENV", "development") != "production" and os.environ.get("PORT") is None
    print(f"Starting Basaveshwara Dabha API server on {host}:{port}...")
    uvicorn.run("main:app", host=host, port=port, reload=reload)
