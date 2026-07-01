require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');

const { dbState, localDb, connectDB } = require('./config/db');
const User = require('./models/User');
const Customer = require('./models/Customer');
const { predictChurn } = require('./utils/predictor');

const csvPath = path.join(__dirname, '../dataset/telecom_customer_churn.csv');

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    console.log('--- 1. Seeding Admin User ---');
    const adminEmail = 'analyst@churnpredict.ai';
    const adminUsername = 'analyst';
    const adminPassword = 'password123';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminUser = {
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    };

    if (dbState.isFallback) {
      const existing = localDb.collection('users').findOne({ email: adminEmail });
      if (!existing) {
        localDb.collection('users').create(adminUser);
        console.log('Fallback Admin user seeded successfully.');
      } else {
        console.log('Fallback Admin user already exists.');
      }
    } else {
      const existing = await User.findOne({ email: adminEmail });
      if (!existing) {
        await User.create(adminUser);
        console.log('MongoDB Admin user seeded successfully.');
      } else {
        console.log('MongoDB Admin user already exists.');
      }
    }

    console.log('--- 2. Seeding Customer Dataset ---');
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found at: ${csvPath}. Please make sure dataset exists.`);
      process.exit(0);
    }

    const results = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          console.log(`Parsed ${results.length} customers from CSV. Running predictions and seeding database...`);
          
          // Seed first 150 customers to avoid overloading connection
          const seedCount = Math.min(results.length, 150);
          console.log(`Seeding first ${seedCount} customers into database...`);

          for (let i = 0; i < seedCount; i++) {
            const row = results[i];
            const custId = row.customerId || row.customerID || row.CustomerID;
            
            const tenure = Number(row.tenure || 0);
            const monthlyCharges = Number(row.monthlyCharges || row.MonthlyCharges || 0);
            const totalCharges = Number(row.totalCharges || row.TotalCharges || (tenure * monthlyCharges));

            const inputData = {
              customerId: custId,
              gender: row.gender || row.Gender || 'Male',
              seniorCitizen: Number(row.seniorCitizen || row.SeniorCitizen || 0),
              partner: row.partner || row.Partner || 'No',
              dependents: row.dependents || row.Dependents || 'No',
              tenure,
              phoneService: row.phoneService || row.PhoneService || 'Yes',
              multipleLines: row.multipleLines || row.MultipleLines || 'No',
              internetService: row.internetService || row.InternetService || 'DSL',
              onlineSecurity: row.onlineSecurity || row.OnlineSecurity || 'No',
              onlineBackup: row.onlineBackup || row.OnlineBackup || 'No',
              deviceProtection: row.deviceProtection || row.DeviceProtection || 'No',
              techSupport: row.techSupport || row.TechSupport || 'No',
              streamingTV: row.streamingTV || row.StreamingTV || 'No',
              streamingMovies: row.streamingMovies || row.StreamingMovies || 'No',
              contract: row.contract || row.Contract || 'Month-to-month',
              paperlessBilling: row.paperlessBilling || row.PaperlessBilling || 'No',
              paymentMethod: row.paymentMethod || row.PaymentMethod || 'Electronic check',
              monthlyCharges,
              totalCharges
            };

            // Run predictor
            const predResult = await predictChurn(inputData);
            inputData.churn = predResult.churn;
            inputData.churnProbability = predResult.probability;
            inputData.churnRiskLevel = predResult.riskLevel;
            inputData.riskFactors = predResult.riskFactors;

            if (dbState.isFallback) {
              const existingCust = localDb.collection('customers').findOne({ customerId: custId });
              if (!existingCust) {
                localDb.collection('customers').create(inputData);
              }
            } else {
              await Customer.findOneAndUpdate(
                { customerId: custId },
                inputData,
                { upsert: true, new: true }
              );
            }
          }

          console.log(`Database seeding completed. Successfully loaded ${seedCount} customers.`);
          process.exit(0);
        } catch (csvErr) {
          console.error('Error seeding customers:', csvErr);
          process.exit(1);
        }
      });

  } catch (err) {
    console.error('Database connection failed during seeding:', err);
    process.exit(1);
  }
};

seedData();
