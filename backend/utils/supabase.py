import os
from supabase import create_client, Client
from typing import Optional

class SupabaseClient:
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        if cls._instance is None:
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_ANON_KEY")
            
            print(f"🔍 [DEBUG] Initializing Supabase client...")
            print(f"🔍 [DEBUG] Supabase URL: {supabase_url}")
            print(f"🔍 [DEBUG] Supabase Key: {supabase_key[:20]}..." if supabase_key else "❌ [DEBUG] No Supabase key found")
            
            if not supabase_url or not supabase_key:
                raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables")
            
            cls._instance = create_client(supabase_url, supabase_key)
            print("✅ [DEBUG] Supabase client initialized successfully")
            
        return cls._instance

def get_supabase() -> Client:
    return SupabaseClient.get_client()