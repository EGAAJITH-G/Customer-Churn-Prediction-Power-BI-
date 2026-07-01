# Telecom Churn Analytics - Power BI Dashboard Setup

This guide explains how to connect, model, and visualize the generated telecom churn dataset in Microsoft Power BI.

---

## 🔌 Connecting to Data

1. Open **Power BI Desktop**.
2. Click on **Get Data** -> **Text/CSV**.
3. Browse and select the dataset file: `dataset/telecom_customer_churn.csv`.
4. Click **Transform Data** to open the Power Query Editor.
5. Verify column data types:
   - `tenure`, `monthlyCharges`, `totalCharges`, `seniorCitizen` as numbers.
   - All other categorical columns as text.
6. Click **Close & Apply**.

---

## 🧮 Custom DAX Business Metrics

Create the following measures in Power BI for KPI analysis:

### 1. Total Customers
```dax
Total Customers = COUNT(telecom_customer_churn[customerId])
```

### 2. Churned Customers
```dax
Churned Customers = CALCULATE(
    COUNT(telecom_customer_churn[customerId]), 
    telecom_customer_churn[churn] = "Yes"
)
```

### 3. Churn Rate (%)
```dax
ChurnRate = DIVIDE([Churned Customers], [Total Customers], 0) * 100
```

### 4. Monthly Recurring Revenue (MRR)
```dax
MRR = SUM(telecom_customer_churn[monthlyCharges])
```

### 5. Revenue Lost (Monthly)
```dax
Monthly Revenue Lost = CALCULATE(
    SUM(telecom_customer_churn[monthlyCharges]), 
    telecom_customer_churn[churn] = "Yes"
)
```

### 6. Average Tenure (Months)
```dax
Avg Tenure = AVERAGE(telecom_customer_churn[tenure])
```

---

## 🎨 Recommended Visualization Panels

### Screen 1: Executive KPI Dashboard
- **Top Row Cards**: Total Customers, Active MRR, Monthly Revenue Lost, Churn Rate %, Average Tenure.
- **Bar Chart**: Customers by Contract Type (Month-to-month vs. One Year vs. Two Year) split by Churn Status.
- **Donut Chart**: Churn by Internet Service Type (Fiber Optic vs. DSL vs. None).
- **Line Chart**: Customer Tenure Distribution vs. Churn Rate.

### Screen 2: Demographics & Service Risk Analysis
- **Column Chart**: Churn Rate by Payment Method (Electronic Check, Mailed Check, Automatic Transfers).
- **TreeMap**: Churn Breakdown by Tech Support and Online Security Subscriptions.
- **Scatter Plot**: Monthly Charges vs. Tenure (Grouped by Churn Yes/No) to identify high-cost early-stage risks.

### Screen 3: AI Churn Predictions & Actions
- **KPI Card**: Churn Risk Score.
- **Matrix Table**: Top 50 High-Risk Customers (Tenure < 12, Monthly Charges > $80, Month-to-Month Contract).
- **Filters Panel**: Filter by State/Region, Gender, and Payment Profile.
