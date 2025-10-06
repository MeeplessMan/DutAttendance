# File: backend/supabase_client.py

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# This is the most important part: load the .env file FIRST.
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    raise ValueError("Could not load Supabase credentials. Make sure .env file exists in 'backend' folder.")

# Create one single client instance that the rest of our app will import and use.
supabase: Client = create_client(url, key)