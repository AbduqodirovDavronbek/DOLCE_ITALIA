import os
import random
from datetime import datetime, timedelta
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.routes import orders, products

load_dotenv()

OTP_TTL_MINUTES = 5
OTP_STORE = {}
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
ALLOWED_ORIGINS = ["*"]

app = FastAPI(
    title="Dolce Italia API",
    description="API for Dolce Italia e-commerce platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = Path(__file__).resolve().parent.parent / "static"
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])


class SendOtpRequest(BaseModel):
    phone: str


class VerifyOtpRequest(BaseModel):
    phone: str
    otp_code: int


async def send_telegram_text(message: str) -> None:
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    async with httpx.AsyncClient() as client:
        await client.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": message}, timeout=5)


@app.post("/api/auth/send-otp")
async def send_otp(request: SendOtpRequest):
    code = random.randint(1000, 9999)
    OTP_STORE[request.phone] = {
        "code": code,
        "expires_at": datetime.utcnow() + timedelta(minutes=OTP_TTL_MINUTES),
    }
    try:
        await send_telegram_text(f"OTP for {request.phone}: {code}")
    except Exception:
        pass
    return {"success": True, "message": "OTP generated"}


@app.post("/api/auth/verify-otp")
async def verify_otp(request: VerifyOtpRequest):
    entry = OTP_STORE.get(request.phone)
    if not entry:
        return {"success": False, "message": "No pending code for this phone"}
    if datetime.utcnow() > entry["expires_at"]:
        OTP_STORE.pop(request.phone, None)
        return {"success": False, "message": "Code expired"}
    if entry["code"] == request.otp_code:
        OTP_STORE.pop(request.phone, None)
        return {"success": True, "message": "Verified"}
    return {"success": False, "message": "Invalid code"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Dolce Italia API"}


@app.get("/")
async def root():
    return {"name": "Dolce Italia API", "version": "1.0.0", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
