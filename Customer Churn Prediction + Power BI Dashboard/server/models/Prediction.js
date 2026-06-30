const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true
  },
  inputs: {
    type: Object,
    required: true
  },
  churnPrediction: {
    type: String,
    enum: ['Yes', 'No'],
    required: true
  },
  probability: {
    type: Number,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  riskFactors: {
    type: [String],
    default: []
  },
  modelUsed: {
    type: String,
    default: 'Random Forest'
  },
  performedBy: {
    type: String,
    default: 'system'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
