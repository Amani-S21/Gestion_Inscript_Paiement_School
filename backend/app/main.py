from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.session import SessionLocal
from app.routers.admin_router import router as admin_router
from app.routers.auth_router import router as auth_router
from app.routers.student_space_router import router as student_space_router
from app.seed import seed_initial_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="GESTION_INSCRIPTION_PAIEMENT",
    description="API de gestion des inscriptions, paiements et espace eleve de l'Institut NENGAPETA.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Bienvenue dans GESTION_INSCRIPTION_PAIEMENT"}


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(student_space_router)

