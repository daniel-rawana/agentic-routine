from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='../.env, .env', extra='ignore')
    GEMINI_API_KEY: str | None = None
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    GOOGLE_REDIRECT_URI: str | None = None
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    BACKEND_ORIGIN: str = "http://localhost:8000"

settings = Settings()
