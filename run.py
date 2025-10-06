# File: run.py (in the ROOT LastTry folder)

from backend import create_app
import os

# Create the app using our factory from the backend package
app = create_app()

if __name__ == '__main__':
    # Get port from environment variables or default to 8000
    port = int(os.environ.get("PORT", 8000))
    # Run the app
    app.run(host='0.0.0.0', port=port, debug=True)