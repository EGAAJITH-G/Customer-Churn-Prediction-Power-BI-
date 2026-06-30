const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    unique: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  seniorCitizen: {
    type: Number,
    enum: [0, 1],
    default: 0
  },
  partner: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  dependents: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  tenure: {
    type: Number,
    required: true
  },
  phoneService: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'Yes'
  },
  multipleLines: {
    type: String,
    enum: ['Yes', 'No', 'No phone service'],
    default: 'No'
  },
  internetService: {
    type: String,
    enum: ['DSL', 'Fiber optic', 'No'],
    default: 'DSL'
  },
  onlineSecurity: {
    type: String,
    enum: ['Yes', 'No', 'No internet service'],
    default: 'No'
  },
  onlineBackup: {
    type: String,
    enum: ['Yes', 'No', 'No internet service'],
    default: 'No'
  },
  deviceProtection: {
    type: String,
    enum: ['Yes', 'No', 'No internet service'],
    default: 'No'
  },
  techSupport: {
    type: String,
    enum: ['Yes', 'No', 'No internet service'],
    default: 'No'
  },
  streamingTV: {
    type: String,
    enum: ['Yes', 'No', 'No internet service'],
    default: 'No'
  },
  streamingMovies: {
    type: String,
    enum: ['Yes', 'No', 'No internet service'],
    default: 'No'
  },
  contract: {
    type: String,
    enum: ['Month-to-month', 'One year', 'Two year'],
    required: true
  },
  paperlessBilling: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'Yes'
  },
  paymentMethod: {
    type: String,
    enum: ['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)'],
    required: true
  },
  monthlyCharges: {
    type: Number,
    required: true
  },
  totalCharges: {
    type: Number,
    required: true
  },
  churn: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  churnProbability: {
    type: Number,
    default: 0.0
  },
  churnRiskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  riskFactors: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Customer', CustomerSchema);
