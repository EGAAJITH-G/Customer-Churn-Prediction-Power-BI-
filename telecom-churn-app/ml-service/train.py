import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib

# Ensure output directories exist
os.makedirs('ml-service/dataset', exist_ok=True)
os.makedirs('ml-service/saved_model', exist_ok=True)

# 1. Generate Synthetic Telecom Churn Data
def generate_synthetic_data(num_samples=1000):
    np.random.seed(42)
    
    customer_ids = [f'CUST-{np.random.randint(10000000, 99999999)}' for _ in range(num_samples)]
    genders = np.random.choice(['Male', 'Female'], num_samples)
    senior_citizens = np.random.choice([0, 1], num_samples, p=[0.85, 0.15])
    partners = np.random.choice(['Yes', 'No'], num_samples, p=[0.5, 0.5])
    dependents = np.random.choice(['Yes', 'No'], num_samples, p=[0.3, 0.7])
    
    # Tenure: log-normal or uniform
    tenures = np.random.randint(1, 73, num_samples)
    
    phone_services = np.random.choice(['Yes', 'No'], num_samples, p=[0.9, 0.1])
    multiple_lines = []
    for ps in phone_services:
        if ps == 'No':
            multiple_lines.append('No phone service')
        else:
            multiple_lines.append(np.random.choice(['Yes', 'No'], p=[0.4, 0.6]))
            
    internet_services = np.random.choice(['DSL', 'Fiber optic', 'No'], num_samples, p=[0.4, 0.4, 0.2])
    
    online_securities = []
    online_backups = []
    device_protections = []
    tech_supports = []
    streaming_tvs = []
    streaming_movies = []
    
    for iserv in internet_services:
        if iserv == 'No':
            online_securities.append('No internet service')
            online_backups.append('No internet service')
            device_protections.append('No internet service')
            tech_supports.append('No internet service')
            streaming_tvs.append('No internet service')
            streaming_movies.append('No internet service')
        else:
            online_securities.append(np.random.choice(['Yes', 'No'], p=[0.3, 0.7]))
            online_backups.append(np.random.choice(['Yes', 'No'], p=[0.4, 0.6]))
            device_protections.append(np.random.choice(['Yes', 'No'], p=[0.4, 0.6]))
            tech_supports.append(np.random.choice(['Yes', 'No'], p=[0.3, 0.7]))
            streaming_tvs.append(np.random.choice(['Yes', 'No'], p=[0.5, 0.5]))
            streaming_movies.append(np.random.choice(['Yes', 'No'], p=[0.5, 0.5]))
            
    contracts = np.random.choice(['Month-to-month', 'One year', 'Two year'], num_samples, p=[0.55, 0.20, 0.25])
    paperless_billings = np.random.choice(['Yes', 'No'], num_samples, p=[0.6, 0.4])
    payment_methods = np.random.choice(
        ['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)'],
        num_samples,
        p=[0.35, 0.25, 0.20, 0.20]
    )
    
    # Calculate Monthly Charges based on services subscribed
    monthly_charges = []
    for i in range(num_samples):
        base = 20.0
        if phone_services[i] == 'Yes':
            base += 10.0
            if multiple_lines[i] == 'Yes':
                base += 10.0
        if internet_services[i] == 'DSL':
            base += 30.0
        elif internet_services[i] == 'Fiber optic':
            base += 50.0
            
        if online_securities[i] == 'Yes': base += 8.0
        if online_backups[i] == 'Yes': base += 8.0
        if device_protections[i] == 'Yes': base += 8.0
        if tech_supports[i] == 'Yes': base += 8.0
        if streaming_tvs[i] == 'Yes': base += 12.0
        if streaming_movies[i] == 'Yes': base += 12.0
        
        # Add a bit of noise
        base += np.random.normal(0, 3)
        monthly_charges.append(round(max(15.0, base), 2))
        
    total_charges = [round(monthly_charges[i] * tenures[i], 2) for i in range(num_samples)]
    
    # Generate realistic churn label using probability score
    churns = []
    for i in range(num_samples):
        prob = 0.15 # baseline churn probability
        
        if contracts[i] == 'Month-to-month': prob += 0.35
        elif contracts[i] == 'Two year': prob -= 0.15
        
        if tenures[i] <= 6: prob += 0.20
        elif tenures[i] > 24: prob -= 0.10
        
        if internet_services[i] == 'Fiber optic': prob += 0.15
        if tech_supports[i] == 'No': prob += 0.08
        if online_securities[i] == 'No': prob += 0.08
        if payment_methods[i] == 'Electronic check': prob += 0.12
        if senior_citizens[i] == 1: prob += 0.05
        
        prob = max(0.01, min(0.99, prob))
        churns.append('Yes' if np.random.rand() < prob else 'No')

    df = pd.DataFrame({
        'customerID': customer_ids,
        'gender': genders,
        'SeniorCitizen': senior_citizens,
        'Partner': partners,
        'Dependents': dependents,
        'tenure': tenures,
        'PhoneService': phone_services,
        'MultipleLines': multiple_lines,
        'InternetService': internet_services,
        'OnlineSecurity': online_securities,
        'OnlineBackup': online_backups,
        'DeviceProtection': device_protections,
        'TechSupport': tech_supports,
        'StreamingTV': streaming_tvs,
        'StreamingMovies': streaming_movies,
        'Contract': contracts,
        'PaperlessBilling': paperless_billings,
        'PaymentMethod': payment_methods,
        'MonthlyCharges': monthly_charges,
        'TotalCharges': total_charges,
        'Churn': churns
    })
    return df

def preprocess_and_train():
    print("Generating dataset...")
    df = generate_synthetic_data(1000)
    
    # Save the dataset to CSV
    df.to_csv('ml-service/dataset/telecom_customer_churn.csv', index=False)
    print("Dataset saved to ml-service/dataset/telecom_customer_churn.csv")
    
    # We will also save a copy in the parent dataset/ folder
    os.makedirs('dataset', exist_ok=True)
    df.to_csv('dataset/telecom_customer_churn.csv', index=False)
    print("Dataset copy saved to dataset/telecom_customer_churn.csv")

    # Preprocessing
    # Drop CustomerID
    X = df.drop(columns=['customerID', 'Churn'])
    y = df['Churn'].map({'Yes': 1, 'No': 0})
    
    # Perform manual encoding for prediction mapping consistency
    categorical_cols = [
        'gender', 'Partner', 'Dependents', 'PhoneService', 'MultipleLines',
        'InternetService', 'OnlineSecurity', 'OnlineBackup', 'DeviceProtection',
        'TechSupport', 'StreamingTV', 'StreamingMovies', 'Contract',
        'PaperlessBilling', 'PaymentMethod'
    ]
    
    mappings = {}
    for col in categorical_cols:
        X[col] = X[col].astype('category')
        mappings[col] = dict(enumerate(X[col].cat.categories))
        X[col] = X[col].cat.codes

    # Numerical features scaling
    scaler = StandardScaler()
    num_cols = ['tenure', 'MonthlyCharges', 'TotalCharges']
    X[num_cols] = scaler.fit_transform(X[num_cols])

    # Train test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train model
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)
    print(f"Model accuracy on test set: {accuracy:.4f}")

    # Feature importances
    feature_importances = dict(zip(X.columns, model.feature_importances_))
    print("Top feature importances:", sorted(feature_importances.items(), key=lambda x: x[1], reverse=True)[:5])

    # Save artifact package
    model_package = {
        'model': model,
        'scaler': scaler,
        'categorical_cols': categorical_cols,
        'numerical_cols': num_cols,
        'mappings': mappings,
        'feature_names': list(X.columns),
        'accuracy': accuracy
    }
    
    joblib.dump(model_package, 'ml-service/saved_model/churn_model.pkl')
    print("Model package saved to ml-service/saved_model/churn_model.pkl")

if __name__ == '__main__':
    preprocess_and_train()
