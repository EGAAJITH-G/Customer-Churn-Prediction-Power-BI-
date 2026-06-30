const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  fileType: {
    type: String,
    enum: ['PDF', 'CSV', 'XLSX'],
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  generatedBy: {
    type: String,
    default: 'system'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);
