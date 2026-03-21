from fastapi import FastAPI
from routers import search

app = FastAPI(title="HooHacks26 - Sustainable Fashion API")

app.include_router(search.router)
