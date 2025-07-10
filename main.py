from fastapi import FastAPI
from alerts import router as alerts_router
from pricing import router as pricing_router

app = FastAPI(
    title="AI-powered Inventory Management System",
    description="MVP for inventory alerts and dynamic pricing.",
    version="0.1.0"
)

app.include_router(alerts_router, prefix="/alerts", tags=["Alerts"])
app.include_router(pricing_router, prefix="/pricing", tags=["Pricing"]) 