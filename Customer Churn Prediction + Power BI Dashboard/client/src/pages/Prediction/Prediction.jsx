import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Brain, 
  HelpCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Upload, 
  Download, 
  Percent, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import Loader from '../../components/Loader/Loader';
import styles from './Prediction.module.css';

const Prediction = () => {
  const { token, API_URL } = useAuth();
  
  // Tab State: 'single' or 'batch'
  const [activeTab, setActiveTab] = useState('single');

  // 1. Single Simulator States
  const [formData, setFormData] = useState({
    customerId: '',
    gender: 'Male',
    seniorCitizen: 0,
    partner: 'No',
    dependents: 'No',
    tenure: 12,
    phoneService: 'Yes',
    multipleLines: 'No',
    internetService: 'DSL',
    onlineSecurity: 'No',
    onlineBackup: 'No',
    deviceProtection: 'No',
    techSupport: 'No',
    streamingTV: 'No',
    streamingMovies: 'No',
    contract: 'Month-to-month',
    paperlessBilling: 'Yes',
    paymentMethod: 'Electronic check',
    monthlyCharges: 65,
    totalCharges: 780
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // 2. Retention Sandbox States
  const [sandboxDiscount, setSandboxDiscount] = useState(0); // 0% to 30%
  const [sandboxContract, setSandboxContract] = useState('');
  const [sandboxSupport, setSandboxSupport] = useState(false);
  const [sandboxSecurity, setSandboxSecurity] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState(null);

  // Initialize sandbox values when result is generated
  useEffect(() => {
    if (result) {
      setSandboxDiscount(0);
      setSandboxContract(formData.contract);
      setSandboxSupport(formData.techSupport === 'Yes');
      setSandboxSecurity(formData.onlineSecurity === 'Yes');
    }
  }, [result]);

  // Recalculate Sandbox Churn Risk in real-time
  useEffect(() => {
    if (!result) return;

    let baseProb = result.probability;
    
    // Apply discount impact: every 10% discount lowers churn by 8% absolute
    const discountImpact = (sandboxDiscount / 10) * 0.08;
    baseProb -= discountImpact;

    // Apply contract upgrade impact
    const originalContract = formData.contract;
    if (originalContract === 'Month-to-month') {
      if (sandboxContract === 'One year') baseProb -= 0.25;
      else if (sandboxContract === 'Two year') baseProb -= 0.45;
    } else if (originalContract === 'One year') {
      if (sandboxContract === 'Two year') baseProb -= 0.20;
    }

    // Apply Tech Support bundling impact (reduces by 8%)
    const originalSupport = formData.techSupport === 'Yes';
    if (!originalSupport && sandboxSupport) {
      baseProb -= 0.08;
    }

    // Apply Online Security bundling impact (reduces by 8%)
    const originalSecurity = formData.onlineSecurity === 'Yes';
    if (!originalSecurity && sandboxSecurity) {
      baseProb -= 0.08;
    }

    // Clamp score
    const finalProb = Math.max(0.04, Math.min(0.96, baseProb));
    const finalRisk = finalProb >= 0.7 ? 'High' : finalProb >= 0.4 ? 'Medium' : 'Low';

    setOptimizedResult({
      probability: finalProb,
      riskLevel: finalRisk
    });
  }, [sandboxDiscount, sandboxContract, sandboxSupport, sandboxSecurity, result]);

  // 3. Bulk CSV Batch States
  const [batchFile, setBatchFile] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [batchSummary, setBatchSummary] = useState(null);
  const [batchPage, setBatchPage] = useState(1);
  const recordsPerPage = 8;

  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    let updatedVal = value;
    if (name === 'tenure' || name === 'monthlyCharges' || name === 'totalCharges' || name === 'seniorCitizen') {
      updatedVal = Number(value);
    }
    
    setFormData(prev => {
      const updated = { ...prev, [name]: updatedVal };
      if (name === 'tenure' || name === 'monthlyCharges') {
        updated.totalCharges = Number((updated.tenure * updated.monthlyCharges).toFixed(2));
      }
      return updated;
    });
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/predictions/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('API server returned error');
      const data = await res.json();
      setResult(data.prediction);
    } catch (err) {
      setError('Failed to compute model prediction. Verify server status.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Batch CSV Parsing and Processing
  const handleBatchFileChange = (e) => {
    setBatchFile(e.target.files[0]);
    setBatchResults([]);
    setBatchSummary(null);
  };

  const handleBatchUpload = (e) => {
    e.preventDefault();
    if (!batchFile) return;

    setBatchLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n');
        if (lines.length < 2) throw new Error('CSV file is empty');

        // Extract and clean headers
        const headers = lines[0].split(',').map(h => h.trim().replace(/['"]+/g, ''));
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(',').map(v => v.trim().replace(/['"]+/g, ''));
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          rows.push(row);
        }

        // Process records using realistic prediction rules locally
        let totalRisk = 0;
        let highRiskCount = 0;

        const results = rows.map((row, index) => {
          let score = 0.25;
          
          const customerId = row.CustomerId || row.customerId || `CUST-${1000 + index}`;
          const gender = row.Gender || row.gender || 'Male';
          const contract = row.Contract || row.contract || 'Month-to-month';
          const tenure = Number(row.Tenure || row.tenure || 12);
          const monthlyCharges = Number(row.MonthlyCharges || row.monthlyCharges || 65);
          const techSupport = row.TechSupport || row.techSupport || 'No';
          const onlineSecurity = row.OnlineSecurity || row.onlineSecurity || 'No';
          const paymentMethod = row.PaymentMethod || row.paymentMethod || 'Electronic check';
          
          // Apply model score weighting
          if (contract === 'Month-to-month') score += 0.35;
          else if (contract === 'One year') score -= 0.10;
          else if (contract === 'Two year') score -= 0.15;
          
          if (tenure <= 6) score += 0.20;
          else if (tenure > 24) score -= 0.10;
          
          if (monthlyCharges > 80) score += 0.12;
          if (techSupport === 'No') score += 0.08;
          if (onlineSecurity === 'No') score += 0.08;
          if (paymentMethod.toLowerCase().includes('electronic')) score += 0.12;
          
          const prob = Math.max(0.04, Math.min(0.96, score));
          const riskLevel = prob >= 0.7 ? 'High' : prob >= 0.4 ? 'Medium' : 'Low';

          totalRisk += prob;
          if (riskLevel === 'High') highRiskCount++;

          return {
            customerId,
            gender,
            contract,
            tenure,
            monthlyCharges,
            probability: prob,
            riskLevel
          };
        });

        setBatchResults(results);
        setBatchSummary({
          total: results.length,
          avgRisk: parseFloat(((totalRisk / results.length) * 100).toFixed(1)),
          highRisk: highRiskCount
        });
        setBatchPage(1);
      } catch (err) {
        alert('Failed to parse CSV file. Ensure standard column headings: CustomerId, Gender, Tenure, Contract, MonthlyCharges.');
      } finally {
        setBatchLoading(false);
      }
    };

    reader.readAsText(batchFile);
  };

  // Export Batch Results to CSV
  const handleExportBatch = () => {
    if (batchResults.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,CustomerId,Gender,Contract,Tenure,MonthlyCharges,ChurnProbability,RiskLevel\n";
    batchResults.forEach(r => {
      csvContent += `${r.customerId},${r.gender},${r.contract},${r.tenure},${r.monthlyCharges},${(r.probability * 100).toFixed(1)}%,${r.riskLevel}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `batch_churn_predictions_${new Date().toLocaleDateString().replace(/\//g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRetentionRecommendation = (score, factors) => {
    if (score < 0.4) return "Maintain current plan. Offer standard fidelity rewards.";
    if (score < 0.7) return "Customer is moderately unstable. Suggest transition to a 1-Year contract with a 10% monthly discount.";
    return "HIGH CRITICAL RISK. Agent must proactively call. Recommend upgrading to bundle packages with complementary Online Security & Tech Support.";
  };

  // Batch Pagination calculation
  const indexOfLastRecord = batchPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentBatchRecords = batchResults.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(batchResults.length / recordsPerPage);

  return (
    <div className={styles.container}>
      {/* Visual Navigation Tabs */}
      <div className={styles.tabHeader}>
        <button 
          onClick={() => { setActiveTab('single'); setError(''); }} 
          className={`${styles.tabBtn} ${activeTab === 'single' ? styles.tabBtnActive : ''}`}
        >
          <Brain size={16} />
          <span>Single Profile Simulator</span>
        </button>
        <button 
          onClick={() => { setActiveTab('batch'); setError(''); }} 
          className={`${styles.tabBtn} ${activeTab === 'batch' ? styles.tabBtnActive : ''}`}
        >
          <Upload size={16} />
          <span>Bulk CSV Batch Predictor</span>
        </button>
      </div>

      {activeTab === 'single' ? (
        <div className={styles.layout}>
          {/* Form Column */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <div className={styles.cardHeader}>
              <div className={styles.titleIcon}>
                <Brain size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Churn Simulator Form</h2>
                <p className={styles.cardDesc}>Enter subscriber attributes to calculate risk score.</p>
              </div>
            </div>

            <form onSubmit={handleSingleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Contract Duration</label>
                  <select name="contract" className={styles.select} value={formData.contract} onChange={handleSingleChange}>
                    <option value="Month-to-month">Month-to-month</option>
                    <option value="One year">One year</option>
                    <option value="Two year">Two year</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Tenure (Months)</label>
                  <input
                    type="number"
                    name="tenure"
                    min="1"
                    max="72"
                    className={styles.input}
                    value={formData.tenure}
                    onChange={handleSingleChange}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Internet Service</label>
                  <select name="internetService" className={styles.select} value={formData.internetService} onChange={handleSingleChange}>
                    <option value="DSL">DSL</option>
                    <option value="Fiber optic">Fiber optic</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Tech Support</label>
                  <select name="techSupport" className={styles.select} value={formData.techSupport} onChange={handleSingleChange}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="No internet service">No internet service</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Online Security</label>
                  <select name="onlineSecurity" className={styles.select} value={formData.onlineSecurity} onChange={handleSingleChange}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="No internet service">No internet service</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Payment Method</label>
                  <select name="paymentMethod" className={styles.select} value={formData.paymentMethod} onChange={handleSingleChange}>
                    <option value="Electronic check">Electronic check</option>
                    <option value="Mailed check">Mailed check</option>
                    <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                    <option value="Credit card (automatic)">Credit card (automatic)</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Monthly Charges ($)</label>
                  <input
                    type="number"
                    name="monthlyCharges"
                    min="10"
                    max="200"
                    className={styles.input}
                    value={formData.monthlyCharges}
                    onChange={handleSingleChange}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Senior Citizen (0/1)</label>
                  <select name="seniorCitizen" className={styles.select} value={formData.seniorCitizen} onChange={handleSingleChange}>
                    <option value={0}>No (0)</option>
                    <option value={1}>Yes (1)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
                <Brain size={16} />
                <span>Simulate Churn Risk</span>
              </button>
            </form>
          </div>

          {/* Results & Sandbox Column */}
          <div className={styles.resultColumn}>
            {loading && (
              <div className={`${styles.loadingCard} glass-card`}>
                <Loader />
              </div>
            )}

            {error && (
              <div className={`${styles.errorCard} glass-card`}>
                <AlertTriangle size={32} className={styles.errorIcon} />
                <h3>Computation Failed</h3>
                <p>{error}</p>
              </div>
            )}

            {!loading && !result && !error && (
              <div className={`${styles.emptyCard} glass-card`}>
                <Sparkles size={32} className={styles.emptyIcon} />
                <h3>Awaiting Simulation</h3>
                <p>Fill out the profile attributes and click simulate to trigger the machine learning model.</p>
              </div>
            )}

            {result && (
              <>
                {/* 1. Core Churn Risk Results */}
                <div className={`${styles.resultCard} glass-card`}>
                  <h3 className={styles.resultTitle}>Prediction Results</h3>
                  <p className={styles.resultSub}>Generated via {result.modelUsed}</p>

                  <div className={styles.scoreContainer}>
                    <svg className={styles.gauge} viewBox="0 0 100 50">
                      <path className={styles.gaugeTrack} d="M 10 50 A 40 40 0 0 1 90 50" />
                      <path 
                        className={styles.gaugeFill} 
                        d="M 10 50 A 40 40 0 0 1 90 50" 
                        style={{ strokeDashoffset: 251 - (251 * result.probability) }}
                      />
                    </svg>
                    <div className={styles.scoreText}>
                      <span className={styles.scoreNumber}>{Math.round(result.probability * 100)}%</span>
                      <span className={styles.scoreLabel}>Churn Probability</span>
                    </div>
                  </div>

                  <div className={styles.badgeSection}>
                    <span className={`${styles.riskBadge} ${styles[result.riskLevel]}`}>
                      {result.riskLevel} Churn Risk
                    </span>
                  </div>

                  <div className={styles.driversBox}>
                    <h4 className={styles.driversTitle}>Key Risk Drivers:</h4>
                    <ul className={styles.driversList}>
                      {result.riskFactors.map((factor, index) => (
                        <li key={index} className={styles.driverItem}>
                          <span className={styles.dot} />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.recommendationBox}>
                    <h4 className={styles.recTitle}>Remediation Recommendation:</h4>
                    <p className={styles.recText}>{getRetentionRecommendation(result.probability, result.riskFactors)}</p>
                  </div>
                </div>

                {/* 2. Interactive Retention Sandbox Optimizer */}
                {optimizedResult && (
                  <div className={`${styles.sandboxCard} glass-card`}>
                    <div className={styles.sandboxHeader}>
                      <Settings size={16} className={styles.sandboxHeaderIcon} />
                      <h3 className={styles.sandboxTitle}>Retention Sandbox Optimizer</h3>
                    </div>
                    <p className={styles.sandboxDesc}>Adjust contract extensions, loyalty discounts, and support add-ons to mitigate subscriber risk in real-time.</p>

                    <div className={styles.sandboxBody}>
                      {/* Discount Slider */}
                      <div className={styles.sliderGroup}>
                        <div className={styles.sliderLabelRow}>
                          <span>Apply Loyalty Discount</span>
                          <span className={styles.sliderVal}>{sandboxDiscount}% Off</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="30" 
                          step="5" 
                          value={sandboxDiscount} 
                          onChange={(e) => setSandboxDiscount(Number(e.target.value))}
                          className={styles.rangeSlider}
                        />
                      </div>

                      {/* Contract Selector */}
                      <div className={styles.sandboxInputGroup}>
                        <label className={styles.sandboxInputLabel}>Extend Contract Term</label>
                        <select 
                          value={sandboxContract} 
                          onChange={(e) => setSandboxContract(e.target.value)}
                          className={styles.sandboxSelect}
                        >
                          <option value="Month-to-month">Month-to-month (No Extension)</option>
                          <option value="One year">One year (Loyalty Upgrade)</option>
                          <option value="Two year">Two year (Super Loyalty Upgrade)</option>
                        </select>
                      </div>

                      {/* Checkbox Add-ons */}
                      <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            checked={sandboxSupport} 
                            disabled={formData.techSupport === 'Yes'}
                            onChange={(e) => setSandboxSupport(e.target.checked)} 
                          />
                          <span>Bundle Free Tech Support</span>
                        </label>
                        <label className={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            checked={sandboxSecurity} 
                            disabled={formData.onlineSecurity === 'Yes'}
                            onChange={(e) => setSandboxSecurity(e.target.checked)} 
                          />
                          <span>Bundle Free Online Security</span>
                        </label>
                      </div>

                      {/* Optimized Score Display */}
                      <div className={styles.optimizedRow}>
                        <div className={styles.optScoreSection}>
                          <span className={styles.optLabel}>Optimized Score</span>
                          <div className={styles.optProbText}>
                            <span className={styles.optProbVal}>{Math.round(optimizedResult.probability * 100)}%</span>
                            <span className={`${styles.optRiskBadge} ${styles['opt' + optimizedResult.riskLevel]}`}>
                              {optimizedResult.riskLevel} Churn
                            </span>
                          </div>
                        </div>

                        {/* Retention Success Progress */}
                        <div className={styles.optProgressSection}>
                          <div className={styles.optProgressHeader}>
                            <span>Retention Success Rate</span>
                            <span>{Math.round((100 - optimizedResult.probability * 100))}%</span>
                          </div>
                          <div className={styles.progressBarBg}>
                            <div 
                              className={styles.progressBarFill} 
                              style={{ 
                                width: `${100 - optimizedResult.probability * 100}%`,
                                background: optimizedResult.riskLevel === 'Low' ? 'var(--success)' : optimizedResult.riskLevel === 'Medium' ? 'var(--warning)' : 'var(--danger)'
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mitigation Result Badge */}
                      {optimizedResult.probability < result.probability && (
                        <div className={styles.mitigationSuccessBox}>
                          <TrendingDown size={14} style={{ color: 'var(--success)' }} />
                          <span>
                            Risk Mitigated! Churn probability lowered by <strong>{Math.round((result.probability - optimizedResult.probability) * 100)}%</strong>.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* Batch CSV Predictor Layout */
        <div className={`${styles.batchContainer} glass-card`}>
          <div className={styles.batchHeaderRow}>
            <div>
              <h2 className={styles.batchTitle}>Bulk Subscriber Churn Prediction</h2>
              <p className={styles.batchDesc}>Drag and drop a CSV file containing subscriber listings. Batch calculations will run immediately.</p>
            </div>
            {batchResults.length > 0 && (
              <button onClick={handleExportBatch} className="btn-primary" style={{ gap: '8px' }}>
                <Download size={14} />
                <span>Export Batch Results CSV</span>
              </button>
            )}
          </div>

          <form onSubmit={handleBatchUpload} className={styles.batchUploadForm}>
            <div className={styles.dropZone}>
              <Upload size={28} className={styles.uploadIcon} />
              <p className={styles.dropText}>Select standard subscriber listing CSV file</p>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleBatchFileChange} 
                className={styles.fileInput}
                required
              />
            </div>
            {batchFile && <p className={styles.batchFileName}>Selected: <strong>{batchFile.name}</strong></p>}
            
            <button type="submit" disabled={batchLoading} className="btn-primary" style={{ minWidth: '160px', alignSelf: 'center', justifyContent: 'center' }}>
              {batchLoading ? 'Processing Batch...' : 'Parse & Predict Batch'}
            </button>
          </form>

          {/* Batch results summary Cards */}
          {batchSummary && (
            <div className={styles.batchSummaryRow}>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Total processed</span>
                <span className={styles.summaryValue}>{batchSummary.total} Records</span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Average Churn Risk</span>
                <span className={styles.summaryValue} style={{ color: batchSummary.avgRisk >= 40 ? 'var(--warning)' : 'var(--success)' }}>
                  {batchSummary.avgRisk}%
                </span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>High Risk Profiles</span>
                <span className={styles.summaryValue} style={{ color: batchSummary.highRisk > 0 ? 'var(--danger)' : 'var(--text)' }}>
                  {batchSummary.highRisk} Subscribers
                </span>
              </div>
            </div>
          )}

          {/* Batch Records Table */}
          {batchResults.length > 0 && (
            <div className={styles.batchTableSection}>
              <div className={styles.tableWrapper}>
                <table className={styles.batchTable}>
                  <thead>
                    <tr>
                      <th>Subscriber ID</th>
                      <th>Gender</th>
                      <th>Contract</th>
                      <th>Tenure</th>
                      <th>Monthly Charges</th>
                      <th>Churn Probability</th>
                      <th>Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBatchRecords.map((r, idx) => (
                      <tr key={idx}>
                        <td className={styles.batchIdCell}>{r.customerId}</td>
                        <td>{r.gender}</td>
                        <td>{r.contract}</td>
                        <td>{r.tenure} months</td>
                        <td>${r.monthlyCharges.toFixed(2)}</td>
                        <td className={styles.batchProbCell}>{Math.round(r.probability * 100)}%</td>
                        <td>
                          <span className={`${styles.riskBadge} ${styles[r.riskLevel]}`}>
                            {r.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Batch Table Pagination */}
              {totalPages > 1 && (
                <div className={styles.batchPagination}>
                  <button 
                    disabled={batchPage === 1} 
                    onClick={() => setBatchPage(p => p - 1)}
                    className={styles.pageNavBtn}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className={styles.pageNavInfo}>
                    Page {batchPage} of {totalPages}
                  </span>
                  <button 
                    disabled={batchPage === totalPages} 
                    onClick={() => setBatchPage(p => p + 1)}
                    className={styles.pageNavBtn}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Prediction;
