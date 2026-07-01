const { dbState, localDb } = require('../config/db');
const Customer = require('../models/Customer');

exports.getDashboardStats = async (req, res) => {
  try {
    let customers = [];
    if (dbState.isFallback) {
      customers = localDb.collection('customers').find() || [];
    } else {
      customers = await Customer.find();
    }

    const totalCustomers = customers.length;

    // Handle empty database case gracefully
    if (totalCustomers === 0) {
      return res.json({
        totalCustomers: 0,
        activeCustomers: 0,
        inactiveCustomers: 0,
        revenue: 0,
        revenueLost: 0,
        churnRate: 0,
        averageTenure: 0,
        topRiskCustomers: []
      });
    }

    const activeCustomers = customers.filter(c => c.churn === 'No').length;
    const inactiveCustomers = customers.filter(c => c.churn === 'Yes').length;

    const revenue = customers
      .filter(c => c.churn === 'No')
      .reduce((sum, c) => sum + (c.monthlyCharges || 0), 0);

    const revenueLost = customers
      .filter(c => c.churn === 'Yes')
      .reduce((sum, c) => sum + (c.monthlyCharges || 0), 0);

    const churnRate = parseFloat(((inactiveCustomers / totalCustomers) * 100).toFixed(1));

    const totalTenure = customers.reduce((sum, c) => sum + (c.tenure || 0), 0);
    const averageTenure = parseFloat((totalTenure / totalCustomers).toFixed(1));

    // Get top risk customers (sorted by churnProbability desc)
    const topRiskCustomers = [...customers]
      .filter(c => c.churnRiskLevel === 'High')
      .sort((a, b) => (b.churnProbability || 0) - (a.churnProbability || 0))
      .slice(0, 5);

    res.json({
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      revenue: parseFloat(revenue.toFixed(2)),
      revenueLost: parseFloat(revenueLost.toFixed(2)),
      churnRate,
      averageTenure,
      topRiskCustomers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving dashboard stats' });
  }
};

exports.getAnalyticsStats = async (req, res) => {
  try {
    let customers = [];
    if (dbState.isFallback) {
      customers = localDb.collection('customers').find() || [];
    } else {
      customers = await Customer.find();
    }

    // Fallback/Sample dataset analytics helper
    const total = customers.length;
    if (total === 0) {
      return res.json({
        genderChart: [],
        contractChart: [],
        paymentMethodChart: [],
        internetServiceChart: [],
        tenureChart: [],
        monthlyTrend: []
      });
    }

    // 1. Gender distribution
    const males = customers.filter(c => c.gender === 'Male');
    const females = customers.filter(c => c.gender === 'Female');
    const genderChart = [
      { name: 'Male', active: males.filter(c => c.churn === 'No').length, churned: males.filter(c => c.churn === 'Yes').length },
      { name: 'Female', active: females.filter(c => c.churn === 'No').length, churned: females.filter(c => c.churn === 'Yes').length }
    ];

    // 2. Contract distribution
    const contracts = ['Month-to-month', 'One year', 'Two year'];
    const contractChart = contracts.map(contract => {
      const filtered = customers.filter(c => c.contract === contract);
      return {
        name: contract,
        value: filtered.length,
        churned: filtered.filter(c => c.churn === 'Yes').length
      };
    });

    // 3. Payment methods distribution
    const paymentMethods = [
      'Electronic check',
      'Mailed check',
      'Bank transfer (automatic)',
      'Credit card (automatic)'
    ];
    const paymentMethodChart = paymentMethods.map(method => {
      const filtered = customers.filter(c => c.paymentMethod === method);
      return {
        name: method.replace(' (automatic)', ''),
        value: filtered.length,
        churned: filtered.filter(c => c.churn === 'Yes').length
      };
    });

    // 4. Internet Service distribution
    const internetServices = ['DSL', 'Fiber optic', 'No'];
    const internetServiceChart = internetServices.map(service => {
      const filtered = customers.filter(c => c.internetService === service);
      return {
        name: service,
        value: filtered.length,
        churned: filtered.filter(c => c.churn === 'Yes').length
      };
    });

    // 5. Tenure breakdown
    const tenureChart = [
      { name: '0-12m', value: customers.filter(c => c.tenure <= 12).length, churned: customers.filter(c => c.tenure <= 12 && c.churn === 'Yes').length },
      { name: '13-24m', value: customers.filter(c => c.tenure > 12 && c.tenure <= 24).length, churned: customers.filter(c => c.tenure > 12 && c.tenure <= 24 && c.churn === 'Yes').length },
      { name: '25-48m', value: customers.filter(c => c.tenure > 24 && c.tenure <= 48).length, churned: customers.filter(c => c.tenure > 24 && c.tenure <= 48 && c.churn === 'Yes').length },
      { name: '48m+', value: customers.filter(c => c.tenure > 48).length, churned: customers.filter(c => c.tenure > 48 && c.churn === 'Yes').length }
    ];

    // 6. Monthly charges vs churn trend (buckets)
    const monthlyTrend = [
      { name: '$0-$30', count: customers.filter(c => c.monthlyCharges <= 30).length, churned: customers.filter(c => c.monthlyCharges <= 30 && c.churn === 'Yes').length },
      { name: '$31-$60', count: customers.filter(c => c.monthlyCharges > 30 && c.monthlyCharges <= 60).length, churned: customers.filter(c => c.monthlyCharges > 30 && c.monthlyCharges <= 60 && c.churn === 'Yes').length },
      { name: '$61-$90', count: customers.filter(c => c.monthlyCharges > 60 && c.monthlyCharges <= 90).length, churned: customers.filter(c => c.monthlyCharges > 60 && c.monthlyCharges <= 90 && c.churn === 'Yes').length },
      { name: '$91+', count: customers.filter(c => c.monthlyCharges > 90).length, churned: customers.filter(c => c.monthlyCharges > 90 && c.churn === 'Yes').length }
    ];

    res.json({
      genderChart,
      contractChart,
      paymentMethodChart,
      internetServiceChart,
      tenureChart,
      monthlyTrend
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving analytics data' });
  }
};
