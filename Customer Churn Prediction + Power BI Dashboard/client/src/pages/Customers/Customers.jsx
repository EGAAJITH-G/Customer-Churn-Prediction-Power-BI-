import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Filter, 
  Upload, 
  Trash2, 
  X, 
  Eye, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Send,
  CheckCircle2,
  Mail
} from 'lucide-react';
import Loader from '../../components/Loader/Loader';
import styles from './Customers.module.css';

const Customers = () => {
  const { token, API_URL } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [churn, setChurn] = useState('');

  // Selected Customer details modal state
  const [selectedCust, setSelectedCust] = useState(null);
  
  // CSV Upload modal state
  const [uploadModal, setUploadModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Campaign States
  const [campaignModal, setCampaignModal] = useState(false);
  const [campaignCust, setCampaignCust] = useState(null);
  const [campaignTemplate, setCampaignTemplate] = useState('Autopay Enrollment Discount');
  const [campaignStatus, setCampaignStatus] = useState('idle'); // idle, sending, success
  const [targetedIds, setTargetedIds] = useState([]);

  // Delete confirmation state
  const [deleteCust, setDeleteCust] = useState(null);

  // Single Customer add state
  const [addModal, setAddModal] = useState(false);
  const [newCust, setNewCust] = useState({
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
    monthlyCharges: 60
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search,
        riskLevel,
        churn
      });

      const res = await fetch(`${API_URL}/customers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers);
        setTotal(data.total);
        setPages(data.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, riskLevel, churn]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/customers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setUploadProgress(true);
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await fetch(`${API_URL}/customers/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setUploadSuccess(data.message);
        setCsvFile(null);
        fetchCustomers();
      } else {
        alert(data.message || 'File upload failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadProgress(false);
    }
  };

  const handleAddCust = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCust)
      });

      if (res.ok) {
        setAddModal(false);
        fetchCustomers();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to add customer');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewCustChange = (e) => {
    const { name, value } = e.target;
    setNewCust(prev => ({
      ...prev,
      [name]: (name === 'tenure' || name === 'monthlyCharges' || name === 'seniorCitizen') ? Number(value) : value
    }));
  };

  return (
    <div className={styles.container}>
      {/* Search & Actions Bar */}
      <div className={styles.actionBar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search subscriber ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className={styles.filters}>
          <select 
            className={styles.select} 
            value={riskLevel} 
            onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
          >
            <option value="">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>

          <select 
            className={styles.select} 
            value={churn} 
            onChange={(e) => { setChurn(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="No">Active</option>
            <option value="Yes">Churned</option>
          </select>
        </div>

        <div className={styles.btnGroup}>
          <button onClick={() => setAddModal(true)} className="btn-secondary" style={{ gap: '6px' }}>
            <Plus size={14} />
            <span>Add Single</span>
          </button>
          <button onClick={() => setUploadModal(true)} className="btn-primary" style={{ gap: '6px' }}>
            <Upload size={14} />
            <span>Upload CSV</span>
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-card" style={{ padding: '24px 32px' }}>
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Subscriber ID</th>
                    <th>Gender</th>
                    <th>Tenure</th>
                    <th>Contract</th>
                    <th>Internet</th>
                    <th>Monthly Charges</th>
                    <th>Churn Risk</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className={styles.emptyTable}>No matching subscribers found.</td>
                    </tr>
                  ) : (
                    customers.map((cust) => (
                      <tr key={cust._id || cust.customerId}>
                        <td className={styles.custIdCell}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{cust.customerId}</span>
                            {targetedIds.includes(cust._id) && (
                              <span className={styles.targetedBadge}>Targeted</span>
                            )}
                          </div>
                        </td>
                        <td>{cust.gender}</td>
                        <td>{cust.tenure} months</td>
                        <td>{cust.contract}</td>
                        <td>{cust.internetService}</td>
                        <td>${cust.monthlyCharges.toFixed(2)}</td>
                        <td>
                          <span className={`${styles.riskBadge} ${styles[cust.churnRiskLevel]}`}>
                            {cust.churnRiskLevel} ({Math.round(cust.churnProbability * 100)}%)
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button onClick={() => setSelectedCust(cust)} className={styles.viewBtn} title="View Profile Details">
                              <Eye size={14} />
                            </button>
                            {cust.churnRiskLevel === 'High' && (
                              <button 
                                onClick={() => { setCampaignCust(cust); setCampaignModal(true); setCampaignStatus('idle'); setCampaignTemplate('Autopay Enrollment Discount'); }} 
                                className={styles.campaignBtn} 
                                title="Launch Retention Campaign"
                              >
                                <Send size={14} />
                              </button>
                            )}
                            <button onClick={() => setDeleteCust(cust)} className={styles.deleteBtn} title="Remove Profile">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className={styles.pagination}>
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  className={styles.pageBtn}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className={styles.pageInfo}>
                  Page {page} of {pages} ({total} subscribers)
                </span>
                <button 
                  disabled={page === pages} 
                  onClick={() => setPage(p => p + 1)}
                  className={styles.pageBtn}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CSV Upload Modal */}
      {uploadModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card`}>
            <div className={styles.modalHeader}>
              <h3>Batch Bulk Import</h3>
              <button onClick={() => { setUploadModal(false); setUploadSuccess(''); }} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            
            {uploadSuccess ? (
              <div className={styles.successWrapper}>
                <AlertCircle size={32} className={styles.successIcon} />
                <p className={styles.successMessage}>{uploadSuccess}</p>
                <button onClick={() => { setUploadModal(false); setUploadSuccess(''); }} className="btn-primary">Done</button>
              </div>
            ) : (
              <form onSubmit={handleCsvUpload} className={styles.modalForm}>
                <p className={styles.modalDesc}>Select a CSV file containing subscriber records. Churn probabilities are calculated automatically on parse.</p>
                <div className={styles.fileDropZone}>
                  <input
                    type="file"
                    accept=".csv"
                    required
                    onChange={(e) => setCsvFile(e.target.files[0])}
                  />
                </div>
                {csvFile && <p className={styles.fileName}>Selected: {csvFile.name}</p>}
                
                <button type="submit" disabled={uploadProgress} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {uploadProgress ? 'Processing...' : 'Upload & Process'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Profile Details Drawer */}
      {selectedCust && (
        <div className={styles.drawerBackdrop} onClick={() => setSelectedCust(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <h3>Subscriber {selectedCust.customerId}</h3>
                <p>Profile telemetry insights</p>
              </div>
              <button onClick={() => setSelectedCust(null)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.drawerContent}>
              <div className={styles.drawerRiskSection}>
                <div className={`${styles.riskBox} ${styles[selectedCust.churnRiskLevel]}`}>
                  <span className={styles.riskLabel}>CHURN RISK SCORE</span>
                  <span className={styles.riskVal}>{Math.round(selectedCust.churnProbability * 100)}% ({selectedCust.churnRiskLevel})</span>
                </div>
              </div>

              <div className={styles.drawerInfoBlock}>
                <h4 className={styles.infoTitle}>Demographics</h4>
                <div className={styles.infoGrid}>
                  <div><span>Gender:</span> {selectedCust.gender}</div>
                  <div><span>Senior Citizen:</span> {selectedCust.seniorCitizen === 1 ? 'Yes' : 'No'}</div>
                  <div><span>Partner:</span> {selectedCust.partner}</div>
                  <div><span>Dependents:</span> {selectedCust.dependents}</div>
                </div>
              </div>

              <div className={styles.drawerInfoBlock}>
                <h4 className={styles.infoTitle}>Services Subscribed</h4>
                <div className={styles.infoGrid}>
                  <div><span>Phone:</span> {selectedCust.phoneService}</div>
                  <div><span>Multiple Lines:</span> {selectedCust.multipleLines}</div>
                  <div><span>Internet:</span> {selectedCust.internetService}</div>
                  <div><span>Online Security:</span> {selectedCust.onlineSecurity}</div>
                  <div><span>Online Backup:</span> {selectedCust.onlineBackup}</div>
                  <div><span>Device Protection:</span> {selectedCust.deviceProtection}</div>
                  <div><span>Tech Support:</span> {selectedCust.techSupport}</div>
                  <div><span>Streaming TV:</span> {selectedCust.streamingTV}</div>
                </div>
              </div>

              <div className={styles.drawerInfoBlock}>
                <h4 className={styles.infoTitle}>Contract & Billing</h4>
                <div className={styles.infoGrid}>
                  <div><span>Contract:</span> {selectedCust.contract}</div>
                  <div><span>Tenure:</span> {selectedCust.tenure} months</div>
                  <div><span>Payment:</span> {selectedCust.paymentMethod}</div>
                  <div><span>Monthly Charges:</span> ${selectedCust.monthlyCharges.toFixed(2)}</div>
                  <div><span>Total Charges:</span> ${selectedCust.totalCharges.toFixed(2)}</div>
                </div>
              </div>

              {selectedCust.riskFactors && selectedCust.riskFactors.length > 0 && (
                <div className={styles.drawerInfoBlock}>
                  <h4 className={styles.infoTitle}>AI Risk Analysis</h4>
                  <ul className={styles.factorsList}>
                    {selectedCust.riskFactors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Single Customer Modal */}
      {addModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card`} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h3>Add New Subscriber</h3>
              <button onClick={() => setAddModal(false)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddCust} className={styles.modalForm}>
              <div className={styles.addFormGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Gender</label>
                  <select name="gender" className={styles.select} value={newCust.gender} onChange={handleNewCustChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Senior Citizen</label>
                  <select name="seniorCitizen" className={styles.select} value={newCust.seniorCitizen} onChange={handleNewCustChange}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Partner</label>
                  <select name="partner" className={styles.select} value={newCust.partner} onChange={handleNewCustChange}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Dependents</label>
                  <select name="dependents" className={styles.select} value={newCust.dependents} onChange={handleNewCustChange}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Tenure (Months)</label>
                  <input type="number" name="tenure" min="1" max="72" className={styles.input} value={newCust.tenure} onChange={handleNewCustChange} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Phone Service</label>
                  <select name="phoneService" className={styles.select} value={newCust.phoneService} onChange={handleNewCustChange}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Internet Service</label>
                  <select name="internetService" className={styles.select} value={newCust.internetService} onChange={handleNewCustChange}>
                    <option value="DSL">DSL</option>
                    <option value="Fiber optic">Fiber optic</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Contract</label>
                  <select name="contract" className={styles.select} value={newCust.contract} onChange={handleNewCustChange}>
                    <option value="Month-to-month">Month-to-month</option>
                    <option value="One year">One year</option>
                    <option value="Two year">Two year</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Payment Method</label>
                  <select name="paymentMethod" className={styles.select} value={newCust.paymentMethod} onChange={handleNewCustChange}>
                    <option value="Electronic check">Electronic check</option>
                    <option value="Mailed check">Mailed check</option>
                    <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                    <option value="Credit card (automatic)">Credit card (automatic)</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Monthly Charges ($)</label>
                  <input type="number" name="monthlyCharges" min="15" max="150" className={styles.input} value={newCust.monthlyCharges} onChange={handleNewCustChange} />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
                Create Profile & Save
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Campaign Outreach Modal */}
      {campaignModal && campaignCust && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card`} style={{ maxWidth: '450px' }}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} className={styles.iconDanger} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0 }}>Retention Campaign</h3>
              </div>
              <button onClick={() => setCampaignModal(false)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            {campaignStatus === 'success' ? (
              <div className={styles.successWrapper} style={{ padding: '24px 0', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <CheckCircle2 size={44} className={styles.iconSuccess} style={{ color: 'var(--success)' }} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--heading)' }}>Campaign Launched!</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-light)', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                  Retention offer <strong>"{campaignTemplate}"</strong> has been dispatched to <strong>{campaignCust.customerId}</strong> via registered email and SMS queue.
                </p>
                <button onClick={() => setCampaignModal(false)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Return to Directory
                </button>
              </div>
            ) : (
              <div style={{ padding: '8px 0' }}>
                <p className={styles.modalDesc} style={{ fontSize: '12.5px', color: 'var(--text-light)', marginBottom: '16px', lineHeight: 1.5 }}>
                  Design a targeted campaign for Subscriber <strong>{campaignCust.customerId}</strong> to prevent churn. Current risk level is <strong>{campaignCust.churnRiskLevel} ({Math.round(campaignCust.churnProbability * 100)}%)</strong>.
                </p>

                <div className={styles.inputGroup} style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className={styles.label} style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text)' }}>Select Campaign Offer</label>
                  <select 
                    className={styles.select} 
                    value={campaignTemplate} 
                    onChange={(e) => setCampaignTemplate(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', outline: 'none', fontSize: '12.5px' }}
                  >
                    <option value="Autopay Enrollment Discount">Autopay Enrollment Discount (15% off MRC)</option>
                    <option value="Annual Contract Upgrade">Annual Contract Upgrade (Save $10/mo)</option>
                    <option value="Premium Add-on Bundle">Premium Add-on Bundle (6 mos Free Support)</option>
                  </select>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', letterSpacing: '0.3px' }}>Offer Mechanics</span>
                  <p style={{ fontSize: '12px', color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>
                    {campaignTemplate === 'Autopay Enrollment Discount' && 'Waives 15% of the monthly billing fee for 12 months in exchange for enrolling in credit card or bank transfer Autopay.'}
                    {campaignTemplate === 'Annual Contract Upgrade' && 'Transitions the customer from Month-to-month to a 1-Year contract with a loyalty price lock saving $10 per month.'}
                    {campaignTemplate === 'Premium Add-on Bundle' && 'Provides complimentary Tech Support, Online Security, and Device Protection add-ons for 6 months (valued at $24/mo).'}
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setCampaignStatus('sending');
                    setTimeout(() => {
                      setCampaignStatus('success');
                      setTargetedIds(prev => [...prev, campaignCust._id]);
                    }, 1200);
                  }}
                  disabled={campaignStatus === 'sending'}
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                >
                  {campaignStatus === 'sending' ? 'Launching Campaign...' : 'Deploy Offer Template'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCust && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card`} style={{ maxWidth: '420px', padding: '28px' }}>
            <div className={styles.modalHeader} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
                <h3 style={{ margin: 0, color: 'var(--danger)', fontSize: '16px', fontWeight: 700 }}>Confirm Permanent Delete</h3>
              </div>
              <button onClick={() => setDeleteCust(null)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ padding: '4px 0' }}>
              <p className={styles.modalDesc} style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '24px', lineHeight: 1.5 }}>
                Are you sure you want to delete subscriber <strong>{deleteCust.customerId}</strong>?
                <br /><br />
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>WARNING:</span> This action is permanent and cannot be undone. All telemetry, contract, billing details, and historical predictions will be completely erased from ChurnPredict AI.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button 
                  onClick={() => setDeleteCust(null)} 
                  className="btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleDelete(deleteCust._id);
                    setDeleteCust(null);
                  }} 
                  className="btn-primary" 
                  style={{ flex: 1, justifyContent: 'center', background: 'var(--danger)', borderColor: 'var(--danger)', color: 'white', padding: '10px' }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
