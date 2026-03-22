import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import search, style_assistant

app = FastAPI(title="threadsense")

origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(search.router)
app.include_router(style_assistant.router)
