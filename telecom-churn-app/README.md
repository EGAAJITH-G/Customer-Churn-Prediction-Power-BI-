# Aurora AI - Telecom Customer Churn Prediction System

Aurora AI is a full-stack Customer Churn Prediction platform featuring an interactive React dashboard, a Node.js Express middle-tier, a Python FastAPI ML microservice, and Power BI visualization templates.

---

## 🎨 Tech Stack & Theme
- **Frontend**: React (Vite SPA) + Recharts + Lucide Icons
- **Backend API**: Node.js + Express + Multer + JWT Auth
- **ML Service**: Python FastAPI + Scikit-Learn (Random Forest)
- **Database**: MongoDB (Mongoose) with an automatic **Local JSON Fallback**
- **Theme**: *Aurora AI Light* (Apple + Linear style glassmorphic design)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.9+) *[Optional - Fallback Enabled]*
- [MongoDB](https://www.mongodb.com/) *[Optional - Fallback Enabled]*

---

### 📂 Directory Structure

```
telecom-churn-prediction/
│
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/              # Reusable UI (Sidebar, Navbar, Loader)
│   │   ├── context/                 # Auth Context
│   │   ├── pages/                   # Views (Dashboard, Prediction, Customers)
│   │   ├── index.css                # Aurora Theme Tokens
│   │   └── App.jsx                  # Guards and Routes
│
├── server/                          # Node.js + Express Backend API
│   ├── config/                      # Mongoose & Fallback Local DB Configs
│   ├── controllers/                 # Business logic
│   ├── middleware/                  # JWT auth & Multer CSV configs
│   ├── models/                      # MongoDB Schemas
│   ├── uploads/                     # Temp file storage & local DB JSON file
│   ├── utils/                       # Prediction fallback engines
│   └── server.js                    # Entry point (Port 5000)
│
├── ml-service/                      # Python FastAPI ML Server
│   ├── dataset/                     # Local train database copy
│   ├── saved_model/                 # Pickled Scikit-Learn classifiers
│   ├── train.py                     # Synthetic generation & Random Forest trainer
│   ├── app.py                       # REST predicting service (Port 8000)
│   └── requirements.txt
│
└── powerbi/
    └── README.md                    # Business DAX & chart config guide
```

---

### 💻 Installation & Startup

#### Step 1: Run the Backend Server
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Express API:
   ```bash
   npm start
   ```
   *Note: If MongoDB is offline, the API automatically mounts `server/uploads/local_db.json` to store user and subscriber details.*

---

#### Step 2: Run the ML Service (Optional)
If Python is installed on your local environment:
1. Navigate to the ml-service folder:
   ```bash
   cd ml-service
   ```
2. Install Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Generate the model and run the service:
   ```bash
   python train.py
   python app.py
   ```
   *Note: If the FastAPI service is not running, the Node.js API automatically routes queries through a built-in smart heuristic rules engine to prevent prediction errors.*

---

#### Step 3: Run the React Client
1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Boot the development server:
   ```bash
   npm run dev
   ```
4. Click the link shown in terminal (typically `http://localhost:5173`) to launch the workspace in your browser.

---

## ⚡ Smart Heuristic Fallback Predictor
In the absence of a running Python FastAPI microservice, the system uses a smart heuristic scoring algorithm based on historical Telco churn patterns:
- **Contracts**: Month-to-month contracts trigger high churn risks (+35%), while Two-year contracts decrease risk (-15%).
- **Tenure**: Early customers (<6 months) carry a +20% risk driver.
- **Billing Methods**: Manual checks and Electronic Billing add +12% risk.
- **Missing Features**: Accounts lacking Tech Support or Online Security incur additional churn penalties (+8% each).
This guarantees that prediction forms and bulk imports remain 100% operational for evaluation and demos.
