const fs = require('fs');
const path = require('path');

const generateData = (numSamples = 200) => {
  const genders = ['Male', 'Female'];
  const partnerDependents = ['Yes', 'No'];
  const phoneService = ['Yes', 'No'];
  const internetService = ['DSL', 'Fiber optic', 'No'];
  const contracts = ['Month-to-month', 'One year', 'Two year'];
  const paymentMethods = [
    'Electronic check',
    'Mailed check',
    'Bank transfer (automatic)',
    'Credit card (automatic)'
  ];
  const paperless = ['Yes', 'No'];

  const rows = [];
  rows.push(
    'customerId,gender,seniorCitizen,partner,dependents,tenure,phoneService,multipleLines,internetService,onlineSecurity,onlineBackup,deviceProtection,techSupport,streamingTV,streamingMovies,contract,paperlessBilling,paymentMethod,monthlyCharges,totalCharges,churn'
  );

  for (let i = 0; i < numSamples; i++) {
    const custId = 'CUST' + Math.floor(10000000 + Math.random() * 90000000);
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const senior = Math.random() < 0.15 ? 1 : 0;
    const partner = partnerDependents[Math.floor(Math.random() * partnerDependents.length)];
    const dependents = partner === 'Yes' && Math.random() < 0.6 ? 'Yes' : 'No';
    const tenure = Math.floor(Math.random() * 71) + 1; // 1 to 72 months

    const phone = Math.random() < 0.9 ? 'Yes' : 'No';
    const lines = phone === 'No' ? 'No phone service' : (Math.random() < 0.4 ? 'Yes' : 'No');

    const internet = internetService[Math.floor(Math.random() * internetService.length)];
    
    let security = 'No';
    let backup = 'No';
    let protection = 'No';
    let support = 'No';
    let tv = 'No';
    let movies = 'No';

    if (internet !== 'No') {
      security = Math.random() < 0.35 ? 'Yes' : 'No';
      backup = Math.random() < 0.4 ? 'Yes' : 'No';
      protection = Math.random() < 0.4 ? 'Yes' : 'No';
      support = Math.random() < 0.35 ? 'Yes' : 'No';
      tv = Math.random() < 0.5 ? 'Yes' : 'No';
      movies = Math.random() < 0.5 ? 'Yes' : 'No';
    } else {
      security = 'No internet service';
      backup = 'No internet service';
      protection = 'No internet service';
      support = 'No internet service';
      tv = 'No internet service';
      movies = 'No internet service';
    }

    const contract = contracts[Math.floor(Math.random() * contracts.length)];
    const billing = paperless[Math.floor(Math.random() * paperless.length)];
    const payment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    // Calculate Monthly charges
    let monthly = 20.0;
    if (phone === 'Yes') {
      monthly += 10.0;
      if (lines === 'Yes') monthly += 10.0;
    }
    if (internet === 'DSL') monthly += 30.0;
    else if (internet === 'Fiber optic') monthly += 50.0;

    if (security === 'Yes') monthly += 8.0;
    if (backup === 'Yes') monthly += 8.0;
    if (protection === 'Yes') monthly += 8.0;
    if (support === 'Yes') monthly += 8.0;
    if (tv === 'Yes') monthly += 12.0;
    if (movies === 'Yes') monthly += 12.0;

    monthly += (Math.random() * 6 - 3); // noise
    monthly = parseFloat(Math.max(18.0, monthly).toFixed(2));

    const total = parseFloat((monthly * tenure).toFixed(2));

    // Determine churn base probability
    let prob = 0.15;
    if (contract === 'Month-to-month') prob += 0.35;
    else if (contract === 'Two year') prob -= 0.15;

    if (tenure <= 6) prob += 0.20;
    else if (tenure > 24) prob -= 0.10;

    if (internet === 'Fiber optic') prob += 0.15;
    if (support === 'No') prob += 0.08;
    if (security === 'No') prob += 0.08;
    if (payment === 'Electronic check') prob += 0.12;
    if (senior === 1) prob += 0.05;

    prob = Math.max(0.01, Math.min(0.99, prob));
    const churn = Math.random() < prob ? 'Yes' : 'No';

    rows.push(
      `${custId},${gender},${senior},${partner},${dependents},${tenure},${phone},${lines},${internet},${security},${backup},${protection},${support},${tv},${movies},${contract},${billing},${payment},${monthly},${total},${churn}`
    );
  }

  // Create dirs
  const datasetDir = path.join(__dirname, '../../dataset');
  if (!fs.existsSync(datasetDir)) {
    fs.mkdirSync(datasetDir, { recursive: true });
  }

  const mlDatasetDir = path.join(__dirname, '../../ml-service/dataset');
  if (!fs.existsSync(mlDatasetDir)) {
    fs.mkdirSync(mlDatasetDir, { recursive: true });
  }

  // Write files
  const csvContent = rows.join('\n');
  fs.writeFileSync(path.join(datasetDir, 'telecom_customer_churn.csv'), csvContent, 'utf-8');
  fs.writeFileSync(path.join(mlDatasetDir, 'telecom_customer_churn.csv'), csvContent, 'utf-8');

  console.log('Datasets successfully written to dataset/ and ml-service/dataset/');
};

generateData(250);
