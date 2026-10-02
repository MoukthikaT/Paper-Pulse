import os
import sys
import uvicorn

# Ensure api and scripts directories are on sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(current_dir, 'api'))
sys.path.insert(0, os.path.join(current_dir, 'scripts'))

from ml_api import app

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=False)
