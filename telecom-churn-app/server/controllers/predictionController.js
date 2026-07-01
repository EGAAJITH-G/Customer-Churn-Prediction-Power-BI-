const { dbState, localDb } = require('../config/db');
const Prediction = require('../models/Prediction');
const Customer = require('../models/Customer');
const { predictChurn } = require('../utils/predictor');

exports.predictSingle = async (req, res) => {
  const customerData = req.body;

  try {
    const predictionResult = await predictChurn(customerData);

    const logData = {
      customerId: customerData.customerId || 'CUST_TEMP_' + Math.floor(Math.random() * 1000),
      inputs: customerData,
      churnPrediction: predictionResult.churn,
      probability: predictionResult.probability,
      riskLevel: predictionResult.riskLevel,
      riskFactors: predictionResult.riskFactors,
      modelUsed: predictionResult.modelUsed,
      performedBy: req.user ? req.user.username : 'anonymous'
    };

    // If customer already exists, let's update their churn predictions
    if (dbState.isFallback) {
      localDb.collection('predictions').create(logData);
      
      const existingCustomer = localDb.collection('customers').findOne({ customerId: logData.customerId });
      if (existingCustomer) {
        localDb.collection('customers').updateById(existingCustomer._id, {
          churn: predictionResult.churn,
          churnProbability: predictionResult.probability,
          churnRiskLevel: predictionResult.riskLevel,
          riskFactors: predictionResult.riskFactors
        });
      }
    } else {
      await Prediction.create(logData);
      
      const existingCustomer = await Customer.findOne({ customerId: logData.customerId });
      if (existingCustomer) {
        existingCustomer.churn = predictionResult.churn;
        existingCustomer.churnProbability = predictionResult.probability;
        existingCustomer.churnRiskLevel = predictionResult.riskLevel;
        existingCustomer.riskFactors = predictionResult.riskFactors;
        await existingCustomer.save();
      }
    }

    res.json({
      success: true,
      prediction: predictionResult
    });
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ message: 'Prediction failed' });
  }
};

exports.getPredictionHistory = async (req, res) => {
  try {
    if (dbState.isFallback) {
      const list = localDb.collection('predictions').find() || [];
      // Sort by date desc
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(list.slice(0, 50));
    } else {
      const list = await Prediction.find().sort({ createdAt: -1 }).limit(50);
      return res.json(list);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving logs' });
  }
};
