const fs = require('fs');
const csv = require('csv-parser');
const { dbState, localDb } = require('../config/db');
const Customer = require('../models/Customer');
const { predictChurn } = require('../utils/predictor');

// Helper to generate a customer ID
const generateCustId = () => {
  return 'CUST' + Math.floor(10000000 + Math.random() * 90000000);
};

exports.getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const riskLevel = req.query.riskLevel || '';
    const churn = req.query.churn || '';
    const skip = (page - 1) * limit;

    if (dbState.isFallback) {
      let list = localDb.collection('customers').find() || [];

      // Apply filtering
      if (search) {
        const query = search.toLowerCase();
        list = list.filter(c => 
          c.customerId.toLowerCase().includes(query) ||
          c.gender.toLowerCase().includes(query) ||
          c.contract.toLowerCase().includes(query) ||
          c.paymentMethod.toLowerCase().includes(query)
        );
      }

      if (riskLevel) {
        list = list.filter(c => c.churnRiskLevel === riskLevel);
      }

      if (churn) {
        list = list.filter(c => c.churn === churn);
      }

      const total = list.length;
      // Sort desc by creation
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const paginatedList = list.slice(skip, skip + limit);

      return res.json({
        customers: paginatedList,
        total,
        page,
        pages: Math.ceil(total / limit)
      });
    } else {
      const query = {};

      if (search) {
        query.$or = [
          { customerId: { $regex: search, $options: 'i' } },
          { gender: { $regex: search, $options: 'i' } },
          { contract: { $regex: search, $options: 'i' } },
          { paymentMethod: { $regex: search, $options: 'i' } }
        ];
      }

      if (riskLevel) {
        query.churnRiskLevel = riskLevel;
      }

      if (churn) {
        query.churn = churn;
      }

      const total = await Customer.countDocuments(query);
      const list = await Customer.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.json({
        customers: list,
        total,
        page,
        pages: Math.ceil(total / limit)
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving customers' });
  }
};

exports.createCustomer = async (req, res) => {
  const data = req.body;

  try {
    if (!data.gender || !data.contract || !data.paymentMethod || data.tenure === undefined || data.monthlyCharges === undefined) {
      return res.status(400).json({ message: 'Missing required customer fields' });
    }

    const customerId = data.customerId || generateCustId();
    const tenure = Number(data.tenure);
    const monthlyCharges = Number(data.monthlyCharges);
    // Standard approximation: TotalCharges = tenure * MonthlyCharges if not provided
    const totalCharges = Number(data.totalCharges || (tenure * monthlyCharges));

    const inputData = {
      customerId,
      gender: data.gender,
      seniorCitizen: Number(data.seniorCitizen || 0),
      partner: data.partner || 'No',
      dependents: data.dependents || 'No',
      tenure,
      phoneService: data.phoneService || 'Yes',
      multipleLines: data.multipleLines || 'No',
      internetService: data.internetService || 'DSL',
      onlineSecurity: data.onlineSecurity || 'No',
      onlineBackup: data.onlineBackup || 'No',
      deviceProtection: data.deviceProtection || 'No',
      techSupport: data.techSupport || 'No',
      streamingTV: data.streamingTV || 'No',
      streamingMovies: data.streamingMovies || 'No',
      contract: data.contract,
      paperlessBilling: data.paperlessBilling || 'No',
      paymentMethod: data.paymentMethod,
      monthlyCharges,
      totalCharges
    };

    // Predict Churn Risk using predictor utility
    const predResult = await predictChurn(inputData);
    inputData.churn = predResult.churn;
    inputData.churnProbability = predResult.probability;
    inputData.churnRiskLevel = predResult.riskLevel;
    inputData.riskFactors = predResult.riskFactors;

    let customer;
    if (dbState.isFallback) {
      // Check duplicate
      const duplicate = localDb.collection('customers').findOne({ customerId });
      if (duplicate) return res.status(400).json({ message: 'Customer ID already exists' });
      customer = localDb.collection('customers').create(inputData);
    } else {
      const duplicate = await Customer.findOne({ customerId });
      if (duplicate) return res.status(400).json({ message: 'Customer ID already exists' });
      customer = await Customer.create(inputData);
    }

    res.status(201).json({
      success: true,
      customer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating customer' });
  }
};

exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    if (dbState.isFallback) {
      const deleted = localDb.collection('customers').deleteById(id);
      if (!deleted) return res.status(404).json({ message: 'Customer not found' });
    } else {
      const deleted = await Customer.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting customer' });
  }
};

// Batch Bulk upload via CSV
exports.uploadCustomersCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a CSV file' });
  }

  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const importedCustomers = [];

        for (let row of results) {
          // Normalize row headers to camelCase
          const custId = row.customerId || row.CustomerID || row.customerID || generateCustId();
          const tenure = Number(row.tenure || row.Tenure || 0);
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

          // Predict churn
          const predResult = await predictChurn(inputData);
          inputData.churn = predResult.churn;
          inputData.churnProbability = predResult.probability;
          inputData.churnRiskLevel = predResult.riskLevel;
          inputData.riskFactors = predResult.riskFactors;

          if (dbState.isFallback) {
            // Upsert fallback
            const existing = localDb.collection('customers').findOne({ customerId: custId });
            if (existing) {
              localDb.collection('customers').updateById(existing._id, inputData);
            } else {
              localDb.collection('customers').create(inputData);
            }
          } else {
            // Upsert MongoDB
            await Customer.findOneAndUpdate(
              { customerId: custId },
              inputData,
              { upsert: true, new: true }
            );
          }

          importedCustomers.push(inputData);
        }

        // Delete temporary file
        fs.unlinkSync(filePath);

        res.json({
          success: true,
          message: `Successfully processed and imported ${importedCustomers.length} customers.`,
          count: importedCustomers.length
        });
      } catch (err) {
        console.error(err);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ message: 'Error processing batch upload file' });
      }
    })
    .on('error', (err) => {
      console.error(err);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ message: 'Error reading uploaded file' });
    });
};
