import streamlit as st
import numpy as np
import pandas as pd
import joblib
from datetime import datetime
from tensorflow.keras.models import load_model

# Load models and scalers
rf_model = joblib.load("rf_model.pkl")
lr_model = joblib.load("lr_model.pkl")
scaler_x = joblib.load("scaler_x.pkl")
scaler_y = joblib.load("scaler_y.pkl")
lstm_model = load_model("lstm_model.keras")

# Title
st.title("📦 AI-Powered Inventory Forecasting & Monitoring")

# Tabs
tab1, tab2 = st.tabs(["📈 Demand Forecasting", "⚠️ Inventory Alerts"])

# Tab 1: Forecasting
with tab1:
    st.subheader("📊 Predict Next-Day Demand")
    model_type = st.selectbox("Choose model", ['Random Forest', 'Linear Regression', 'LSTM'])

    prev_sales = st.number_input("Previous Day Sales", min_value=0.0, step=1.0)
    price = st.number_input("Price", min_value=0.0, step=0.1)
    weather = st.selectbox("Weather", ['Clear', 'Rainy', 'Cloudy', 'Snowy'])
    weather_map = {'Clear': 0, 'Rainy': 1, 'Cloudy': 2, 'Snowy': 3}
    weather_encoded = weather_map[weather]

    if st.button("Predict Demand"):
        features = [[prev_sales, price, weather_encoded]]

        if model_type == 'Random Forest':
            pred = rf_model.predict(features)[0]
        elif model_type == 'Linear Regression':
            pred = lr_model.predict(features)[0]
        elif model_type == 'LSTM':
            x_scaled = scaler_x.transform(features)
            pred_scaled = lstm_model.predict(x_scaled.reshape(1, 1, 3))
            pred = scaler_y.inverse_transform(pred_scaled)[0][0]

        st.success(f"📦 Predicted Demand: {round(pred, 2)} units")

# Tab 2: Alerts
with tab2:
    st.subheader("⚠️ Inventory Alert Checker")

    stock_level = st.number_input("Current Stock Level", min_value=0, step=1)
    expiry_date = st.date_input("Expiry Date")

    if st.button("Check Alerts"):
        alerts = []
        if stock_level < 10:
            alerts.append("⚠️ Low Stock")
        if stock_level > 150:
            alerts.append("⚠️ Overstocked")
        if (expiry_date - datetime.today().date()).days <= 2:
            alerts.append("⚠️ Expiring Soon")

        if alerts:
            st.warning(" | ".join(alerts))
        else:
            st.success("✅ All inventory levels are normal.")
