import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
import joblib

app = FastAPI(title="Telecom Churn Prediction ML Service", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = 'ml-service/saved_model/churn_model.pkl'

# Trigger training if model does not exist
def check_and_train_model():
    if not os.path.exists(MODEL_PATH):
        print("Model file not found. Running training process...")
        try:
            from train import preprocess_and_train
            preprocess_and_train()
        except Exception as e:
            print(f"Error training model: {e}")

check_and_train_model()

# Load model package
model_package = None
if os.path.exists(MODEL_PATH):
    try:
        model_package = joblib.load(MODEL_PATH)
        print("Model package loaded successfully.")
    except Exception as e:
        print(f"Failed to load model package: {e}")

class CustomerInput(BaseModel):
    customerId: str = Field(default="CUST-0000")
    gender: str = Field(default="Male")
    seniorCitizen: int = Field(default=0)
    partner: str = Field(default="No")
    dependents: str = Field(default="No")
    tenure: int = Field(default=1)
    phoneService: str = Field(default="Yes")
    multipleLines: str = Field(default="No")
    internetService: str = Field(default="DSL")
    onlineSecurity: str = Field(default="No")
    onlineBackup: str = Field(default="No")
    deviceProtection: str = Field(default="No")
    techSupport: str = Field(default="No")
    streamingTV: str = Field(default="No")
    streamingMovies: str = Field(default="No")
    contract: str = Field(default="Month-to-month")
    paperlessBilling: str = Field(default="No")
    paymentMethod: str = Field(default="Electronic check")
    monthlyCharges: float = Field(default=20.0)
    totalCharges: float = Field(default=20.0)

@app.get("/health")
def health():
    if model_package is None:
        return {"status": "degraded", "message": "Model not loaded"}
    return {"status": "healthy", "message": "FastAPI ML service is ready", "model_accuracy": model_package.get('accuracy', 0.8)}

@app.post("/predict")
def predict(data: CustomerInput):
    global model_package
    if model_package is None:
        raise HTTPException(status_code=503, detail="Model is not available. Please train the model first.")
    
    try:
        model = model_package['model']
        scaler = model_package['scaler']
        categorical_cols = model_package['categorical_cols']
        numerical_cols = model_package['numerical_cols']
        mappings = model_package['mappings']
        feature_names = model_package['feature_names']
        
        # Prepare input dictionary (keys must match training features case)
        input_dict = {
            'gender': data.gender,
            'SeniorCitizen': data.seniorCitizen,
            'Partner': data.partner,
            'Dependents': data.dependents,
            'tenure': data.tenure,
            'PhoneService': data.phoneService,
            'MultipleLines': data.multipleLines,
            'InternetService': data.internetService,
            'OnlineSecurity': data.onlineSecurity,
            'OnlineBackup': data.onlineBackup,
            'DeviceProtection': data.deviceProtection,
            'TechSupport': data.techSupport,
            'StreamingTV': data.streamingTV,
            'StreamingMovies': data.streamingMovies,
            'Contract': data.contract,
            'PaperlessBilling': data.paperlessBilling,
            'PaymentMethod': data.paymentMethod,
            'MonthlyCharges': data.monthlyCharges,
            'TotalCharges': data.totalCharges
        }
        
        # Convert dictionary to DataFrame
        df_input = pd.DataFrame([input_dict])
        
        # Preprocess: encode categoricals
        for col in categorical_cols:
            val = df_input[col].iloc[0]
            # Inverse map or find category code
            categories = list(mappings[col].values())
            if val in categories:
                code = categories.index(val)
            else:
                # Default to code 0 or match closest
                code = 0
            df_input[col] = code
            
        # Preprocess: scale numericals
        df_input[numerical_cols] = scaler.transform(df_input[numerical_cols])
        
        # Ensure correct column order
        df_input = df_input[feature_names]
        
        # Make predictions
        prob = float(model.predict_proba(df_input)[0][1])
        prediction = int(model.predict(df_input)[0])
        
        # Determine risk level
        if prob >= 0.70:
            risk_level = 'High'
        elif prob >= 0.40:
            risk_level = 'Medium'
        else:
            risk_level = 'Low'
            
        # Extract risk factors based on customer characteristics
        risk_factors = []
        if data.contract == 'Month-to-month':
            risk_factors.append('Month-to-month Contract')
        if data.tenure <= 6:
            risk_factors.append('Very short customer tenure (<= 6 months)')
        if data.internetService == 'Fiber optic':
            risk_factors.append('Fiber optic high-cost service')
        if data.techSupport == 'No':
            risk_factors.append('No technical support subscription')
        if data.onlineSecurity == 'No':
            risk_factors.append('No online security service')
            
        # Bound risk factors to top 3
        risk_factors = risk_factors[:3]
        if not risk_factors:
            risk_factors = ["Baseline risk profile"]
            
        return {
            "prediction": prediction,
            "probability": round(prob, 3),
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "model_used": "Random Forest Classifier"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/train")
def train_model():
    global model_package
    try:
        from train import preprocess_and_train
        preprocess_and_train()
        if os.path.exists(MODEL_PATH):
            model_package = joblib.load(MODEL_PATH)
            return {"success": True, "message": "Model trained successfully", "accuracy": model_package.get('accuracy', 0.8)}
        else:
            raise HTTPException(status_code=500, detail="Training finished but model file not created")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
