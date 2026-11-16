import os
import sys

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"
    reload = os.environ.get("ENV", "development") != "production" and os.environ.get("PORT") is None
    print(f"Starting Basaveshwara Dabha API server on {host}:{port}...")
    uvicorn.run("app.main:app", host=host, port=port, reload=reload)
