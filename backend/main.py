from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from database.seed import create_db_and_tables, seed_data
import os

app = FastAPI(title="DocAuthority API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.on_event("startup")
def on_startup():
    if not os.path.exists("docauthority.db"):
        create_db_and_tables()
        seed_data()

@app.get("/")
def root():
    return {"message": "DocAuthority API is running"}
