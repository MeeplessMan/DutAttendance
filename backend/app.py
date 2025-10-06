# File: backend/app.py
# --- FINAL CORRECTED VERSION ---
from backend import create_app

# Create the app using our factory
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)