from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    
    DATABASE_URL: str
    
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    FRONTEND_URL: str = "http://localhost:5173"
    
    MAX_FILE_SIZE: int = 10485760
    UPLOAD_DIR: str = "uploads"
    
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "noreply@church.org"
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
