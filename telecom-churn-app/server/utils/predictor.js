const dns = require('dns');

// Helper heuristic prediction engine
const runHeuristicPredict = (data) => {
  let score = 0.3; // base probability
  const riskFactors = [];

  // Contract factor
  if (data.contract === 'Month-to-month') {
    score += 0.35;
    riskFactors.push('Month-to-month Contract');
  } else if (data.contract === 'Two year') {
    score -= 0.20;
  } else if (data.contract === 'One year') {
    score -= 0.05;
  }

  // Tenure factor
  const tenure = Number(data.tenure || 0);
  if (tenure <= 6) {
    score += 0.25;
    riskFactors.push('Very short customer tenure (<= 6 months)');
  } else if (tenure <= 18) {
    score += 0.10;
    riskFactors.push('Short customer tenure (7-18 months)');
  } else if (tenure >= 48) {
    score -= 0.15;
  }

  // Internet service & security factors
  if (data.internetService === 'Fiber optic') {
    score += 0.15;
    riskFactors.push('Fiber optic high-cost service');
  } else if (data.internetService === 'No') {
    score -= 0.10;
  }

  if (data.onlineSecurity === 'No') {
    score += 0.08;
    riskFactors.push('No online security service');
  }
  if (data.techSupport === 'No') {
    score += 0.08;
    riskFactors.push('No technical support subscription');
  }

  // Payment Method factor
  if (data.paymentMethod === 'Electronic check') {
    score += 0.12;
    riskFactors.push('Manual billing via Electronic check');
  } else if (data.paymentMethod && data.paymentMethod.includes('automatic')) {
    score -= 0.08;
  }

  // Monthly charges factor
  const monthly = Number(data.monthlyCharges || 0);
  if (monthly > 85) {
    score += 0.10;
    riskFactors.push('High monthly charges (> $85)');
  } else if (monthly < 35) {
    score -= 0.05;
  }

  // Senior citizen
  if (Number(data.seniorCitizen) === 1) {
    score += 0.05;
    riskFactors.push('Senior citizen demographic');
  }

  // Bound the probability
  const probability = Math.max(0.02, Math.min(0.98, score));
  const isChurn = probability >= 0.5 ? 'Yes' : 'No';
  
  let riskLevel = 'Low';
  if (probability >= 0.70) {
    riskLevel = 'High';
  } else if (probability >= 0.40) {
    riskLevel = 'Medium';
  }

  return {
    churn: isChurn,
    probability: parseFloat(probability.toFixed(3)),
    riskLevel,
    riskFactors: riskFactors.slice(0, 3), // return top 3 risk factors
    modelUsed: 'Heuristic Rules Engine (Fallback)'
  };
};

const predictChurn = async (data) => {
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict';
  
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500); // 1.5s timeout for fast response

    const response = await fetch(mlServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(id);

    if (response.ok) {
      const mlResult = await response.json();
      return {
        churn: mlResult.prediction === 1 ? 'Yes' : 'No',
        probability: mlResult.probability,
        riskLevel: mlResult.risk_level,
        riskFactors: mlResult.risk_factors || [],
        modelUsed: mlResult.model_used || 'Random Forest Classifier'
      };
    } else {
      console.warn('ML Service response not OK, using heuristic engine...');
      return runHeuristicPredict(data);
    }
  } catch (err) {
    // Fail silently to fallback
    return runHeuristicPredict(data);
  }
};

module.exports = {
  predictChurn,
  runHeuristicPredict
};
