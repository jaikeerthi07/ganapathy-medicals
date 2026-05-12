import sys
import os

# Add the backend directory to the path so we can import 'app' and 'config'
backend_path = os.path.join(os.path.dirname(__file__), '..', 'InventoryManagementBE')
sys.path.append(backend_path)

from app import create_app

app = create_app()

# This is required for Vercel
# The 'app' variable is automatically detected as the Flask instance.
