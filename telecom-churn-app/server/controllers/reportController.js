const { dbState, localDb } = require('../config/db');
const Report = require('../models/Report');
const Customer = require('../models/Customer');
const pdfGenerator = require('../utils/pdfGenerator');

exports.getReports = async (req, res) => {
  try {
    let list = [];
    if (dbState.isFallback) {
      list = localDb.collection('reports').find() || [];
    } else {
      list = await Report.find().sort({ createdAt: -1 });
    }

    // If there are no reports, let's create a couple of default system reports
    if (list.length === 0) {
      const defaultReports = [
        {
          title: 'Q2 Telecom Churn Executive Summary',
          description: 'A detailed summary of churn rates across contracts and payment profiles.',
          fileType: 'PDF',
          filePath: '/reports/q2_churn_executive_summary.pdf',
          generatedBy: 'system'
        },
        {
          title: 'High-Risk Customer Target Campaign List',
          description: 'Export of all customers with a churn probability higher than 75%.',
          fileType: 'CSV',
          filePath: '/api/reports/download/high_risk_list',
          generatedBy: 'system'
        },
        {
          title: 'ML Model Performance & Feature Importance Log',
          description: 'Model metrics including ROC-AUC curve scores, precision, and recall.',
          fileType: 'PDF',
          filePath: '/reports/ml_model_performance.pdf',
          generatedBy: 'system'
        }
      ];

      for (let rep of defaultReports) {
        if (dbState.isFallback) {
          localDb.collection('reports').create(rep);
        } else {
          await Report.create(rep);
        }
      }

      // Re-fetch
      if (dbState.isFallback) {
        list = localDb.collection('reports').find() || [];
      } else {
        list = await Report.find().sort({ createdAt: -1 });
      }
    }

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving reports' });
  }
};

exports.downloadHighRiskCSV = async (req, res) => {
  try {
    let customers = [];
    if (dbState.isFallback) {
      customers = localDb.collection('customers').find() || [];
    } else {
      customers = await Customer.find();
    }

    const highRisk = customers.filter(c => c.churnRiskLevel === 'High');

    // Build simple CSV string
    let csvContent = 'CustomerId,Gender,Tenure,Contract,PaymentMethod,MonthlyCharges,ChurnProbability,RiskLevel,RiskFactors\n';
    
    highRisk.forEach(c => {
      const factors = (c.riskFactors || []).join('; ');
      csvContent += `${c.customerId},${c.gender},${c.tenure},${c.contract},${c.paymentMethod},${c.monthlyCharges},${c.churnProbability},${c.churnRiskLevel},"${factors}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=high_risk_customers.csv');
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ message: 'Error generating CSV download' });
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    const { id } = req.params;
    let report;
    if (dbState.isFallback) {
      report = localDb.collection('reports').findOne({ _id: id });
    } else {
      report = await Report.findById(id);
    }

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    let pdfBuffer;
    let fileName = 'report.pdf';

    if (report.title.includes('Executive Summary')) {
      pdfBuffer = pdfGenerator.generateExecutiveSummary();
      fileName = 'q2_telecom_churn_executive_summary.pdf';
    } else if (report.title.includes('ML Model Performance') || report.title.includes('Feature Importance')) {
      pdfBuffer = pdfGenerator.generateModelPerformanceLog();
      fileName = 'ml_model_performance_feature_importance_log.pdf';
    } else {
      return res.status(400).json({ message: 'Requested report is not in PDF format' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF download:', err);
    res.status(500).json({ message: 'Error generating PDF download' });
  }
};

exports.createReport = async (req, res) => {
  const { title, description, fileType } = req.body;
  try {
    if (!title || !fileType) {
      return res.status(400).json({ message: 'Title and file type are required' });
    }

    const newReport = {
      title,
      description: description || 'Custom user compiled data report.',
      fileType,
      // For mock simplicity, we point custom PDFs to the ML log download and CSVs to the CSV download
      filePath: fileType === 'CSV' ? '/api/reports/download/high_risk_list' : '/reports/ml_model_performance.pdf',
      generatedBy: req.user.username || 'Analyst Pro',
      createdAt: new Date().toISOString()
    };

    let created;
    if (dbState.isFallback) {
      created = localDb.collection('reports').create(newReport);
    } else {
      created = await Report.create(newReport);
    }

    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating custom report:', err);
    res.status(500).json({ message: 'Error creating custom report' });
  }
};

