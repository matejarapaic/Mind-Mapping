from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://mindmap:mindmap@localhost:5432/mindmap"
    anthropic_api_key: str
    clerk_secret_key: str
    clerk_frontend_api: str
    # Comma-separated list of allowed CORS origins, e.g.:
    # "https://your-app.vercel.app,http://localhost:3000"
    allowed_origins: str = "http://localhost:3000,http://mm.rapaic.info,https://mm.rapaic.info"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
