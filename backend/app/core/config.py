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
    
    ICECAST_HOST: str = "localhost"
    ICECAST_PORT: str = "8000"
    ICECAST_SOURCE_PASSWORD: str = "churchsource123"
    ICECAST_ADMIN_USER: str = "admin"
    ICECAST_ADMIN_PASSWORD: str = "churchadmin123"
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
