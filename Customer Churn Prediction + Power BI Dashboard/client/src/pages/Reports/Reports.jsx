import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Plus, 
  CheckCircle, 
  RefreshCw, 
  Search, 
  Sparkles, 
  AlertCircle, 
  Database,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import Loader from '../../components/Loader/Loader';
import styles from './Reports.module.css';

const Reports = () => {
  const { token, API_URL, user } = useAuth();
  
  // State management
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  
  // Custom compiler form states
  const [reportTitle, setReportTitle] = useState('');
  const [reportFocus, setReportFocus] = useState('Tenure Risk & Churn Profile');
  const [fileFormat, setFileFormat] = useState('PDF');
  const [reportDesc, setReportDesc] = useState('');
  
  // Compiling overlay simulation
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStep, setCompileStep] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Predefined title suggestions based on metrics focus
  const suggestions = {
    'Tenure Risk & Churn Profile': 'Q2 Customer Tenure Decay & Risk Profile',
    'Payment Method Financial Risk': 'Payment Profile MRC Revenue Churn Audit',
    'High Probability Churn List': 'Target Retention Campaign Subscriber List'
  };

  // Auto-fill title suggestion when focus changes
  useEffect(() => {
    if (!reportTitle || Object.values(suggestions).includes(reportTitle)) {
      setReportTitle(suggestions[reportFocus]);
    }
  }, [reportFocus]);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_URL}/reports/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownloadReport = async (reportId, title, fileType) => {
    setDownloading(true);
    try {
      let urlEndpoint = '';
      let defaultFileName = 'report.pdf';

      if (fileType === 'CSV') {
        urlEndpoint = `${API_URL}/reports/download/high_risk_list`;
        defaultFileName = 'high_risk_customers.csv';
      } else {
        // If it's a dynamic report, we map it to the ML performance or Q2 summary depending on title
        if (reportId) {
          urlEndpoint = `${API_URL}/reports/download/pdf/${reportId}`;
        } else {
          urlEndpoint = `${API_URL}/reports/download/pdf/fallback`;
        }
        defaultFileName = title.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.pdf';
      }

      const res = await fetch(urlEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultFileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || 'Failed to download the report.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while downloading the report.');
    } finally {
      setDownloading(false);
    }
  };

  // Compile on-demand custom report
  const handleCompileReport = async (e) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;

    setIsCompiling(true);
    setCompileStep(1);

    // Simulated Compilation Steps for ultimate user experience
    setTimeout(() => {
      setCompileStep(2);
      setTimeout(() => {
        setCompileStep(3);
        setTimeout(async () => {
          // Fire POST request to server to record the generated report
          try {
            const finalDesc = reportDesc.trim() || `Custom data compile focusing on ${reportFocus}. Includes predictive ML scoring metrics.`;
            const res = await fetch(`${API_URL}/reports/create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                title: reportTitle,
                description: finalDesc,
                fileType: fileFormat
              })
            });

            if (res.ok) {
              setCompileStep(4); // Success state
              await fetchReports(); // Re-fetch list
              
              setSuccessMsg(`Report "${reportTitle}" compiled and cataloged!`);
              setTimeout(() => setSuccessMsg(''), 5000);
              
              // Reset form
              setReportDesc('');
            } else {
              alert('Server failed to record custom report.');
              setIsCompiling(false);
            }
          } catch (err) {
            console.error(err);
            alert('Network error occurred during report cataloging.');
            setIsCompiling(false);
          } finally {
            setTimeout(() => {
              setIsCompiling(false);
              setCompileStep(0);
            }, 1000);
          }
        }, 800);
      }, 800);
    }, 800);
  };

  // Filter and search computation
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'PDF') return matchesSearch && r.fileType === 'PDF';
    if (activeFilter === 'CSV') return matchesSearch && r.fileType === 'CSV';
    return matchesSearch;
  });

  if (loading) return <Loader />;

  return (
    <div className={styles.container}>
      
      {/* Dynamic Success Banner */}
      {successMsg && (
        <div className={styles.bannerSuccess} style={{ marginBottom: '24px' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
          <span style={{ color: 'var(--success)', fontWeight: '600' }}>{successMsg}</span>
        </div>
      )}

      {/* 1. Executive Summary KPI Ribbon */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <FileText size={20} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiVal}>{reports.length} Reports</span>
            <span className={styles.kpiTitle}>Total Cataloged</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)' }}>
            <FileText size={20} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiVal}>{reports.filter(r => r.fileType === 'PDF').length} PDFs</span>
            <span className={styles.kpiTitle}>Executive Summaries</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)' }}>
            <FileSpreadsheet size={20} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiVal}>{reports.filter(r => r.fileType === 'CSV').length} CSVs</span>
            <span className={styles.kpiTitle}>Data Spreadsheets</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: 'var(--primary-glow)', color: 'var(--accent)' }}>
            <Database size={20} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiVal}>
              <span className={styles.syncPulse} />
              <span>Online</span>
            </span>
            <span className={styles.kpiTitle}>DB Sync Status</span>
          </div>
        </div>
      </div>

      {/* 2. Split Workspace Grid */}
      <div className={styles.splitGrid}>
        
        {/* Left Column: Interactive Report Compiler */}
        <div className={styles.leftCol}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <div className={styles.panelTitleRow}>
              <Sparkles className={styles.panelIcon} size={18} />
              <h3 className={styles.panelTitle}>On-Demand Report Compiler</h3>
            </div>
            <p className={styles.panelDesc}>Select variables, target metrics focus, and compile custom analytical reports from database seeds.</p>
            
            {!isCompiling ? (
              <form onSubmit={handleCompileReport} className={styles.compilerForm}>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Select Metrics Focus</label>
                  <select 
                    className={styles.select}
                    value={reportFocus}
                    onChange={(e) => setReportFocus(e.target.value)}
                  >
                    <option value="Tenure Risk & Churn Profile">Tenure Risk & Churn Profile</option>
                    <option value="Payment Method Financial Risk">Payment Method Financial Risk Profile</option>
                    <option value="High Probability Churn List">High Probability Churn List</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Custom Report Title</label>
                  <input 
                    type="text"
                    required
                    className={styles.input}
                    placeholder="Enter report title"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Choose Output Format</label>
                  <div className={styles.formatSelector}>
                    <div 
                      className={`${styles.formatCard} ${fileFormat === 'PDF' ? styles.formatCardActive : ''}`}
                      onClick={() => setFileFormat('PDF')}
                    >
                      <div className={styles.formatIcon} style={{ color: 'var(--danger)' }}>
                        <FileText size={20} />
                      </div>
                      <div className={styles.formatDetails}>
                        <span className={styles.formatName}>PDF Document</span>
                        <span className={styles.formatDescText}>Executive Summary</span>
                      </div>
                    </div>

                    <div 
                      className={`${styles.formatCard} ${fileFormat === 'CSV' ? styles.formatCardActive : ''}`}
                      onClick={() => setFileFormat('CSV')}
                    >
                      <div className={styles.formatIcon} style={{ color: 'var(--success)' }}>
                        <FileSpreadsheet size={20} />
                      </div>
                      <div className={styles.formatDetails}>
                        <span className={styles.formatName}>CSV Spreadsheet</span>
                        <span className={styles.formatDescText}>Raw Data Table</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Compile Description (Optional)</label>
                  <textarea 
                    className={styles.textarea}
                    placeholder="Provide description or target notes..."
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }}>
                  <Plus size={16} />
                  <span>Compile & Generate Report</span>
                </button>
              </form>
            ) : (
              /* Step-by-step compilation loader */
              <div className={styles.compilingContainer}>
                <div className={styles.spinner} style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
                <h4 className={styles.compilingTitle}>Compiling Real-Time Telemetry</h4>
                <p className={styles.compilingDesc}>Heuristics and predictive modeling engines calculations in progress.</p>
                
                <div className={styles.stepsWrapper}>
                  <div className={`${styles.stepItem} ${compileStep >= 1 ? (compileStep > 1 ? styles.stepDone : styles.stepActive) : ''}`}>
                    {compileStep > 1 ? <CheckCircle size={14} /> : <div className={styles.spinner} />}
                    <span>Scanning customer database profiles...</span>
                  </div>

                  <div className={`${styles.stepItem} ${compileStep >= 2 ? (compileStep > 2 ? styles.stepDone : styles.stepActive) : ''}`}>
                    {compileStep > 2 ? <CheckCircle size={14} /> : (compileStep === 2 ? <div className={styles.spinner} /> : <div className={styles.spinner} style={{ opacity: 0 }} />)}
                    <span>Scoring ML model churn predictions...</span>
                  </div>

                  <div className={`${styles.stepItem} ${compileStep >= 3 ? (compileStep > 3 ? styles.stepDone : styles.stepActive) : ''}`}>
                    {compileStep > 3 ? <CheckCircle size={14} /> : (compileStep === 3 ? <div className={styles.spinner} /> : <div className={styles.spinner} style={{ opacity: 0 }} />)}
                    <span>Compiling PDF/CSV layouts...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Library Catalog Catalogue list */}
        <div className={styles.rightCol}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <div className={styles.panelTitleRow}>
              <Database className={styles.panelIcon} size={18} />
              <h3 className={styles.panelTitle}>Analytical Reports Library</h3>
            </div>
            <p className={styles.panelDesc}>Search, filter, and download compiled models and data tables.</p>
            
            {/* Search and Filters */}
            <div className={styles.searchFilterBar}>
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={14} />
                <input 
                  type="text" 
                  className={styles.searchInput}
                  placeholder="Search report title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className={styles.filterTabs}>
                <button 
                  onClick={() => setActiveFilter('ALL')}
                  className={`${styles.filterPill} ${activeFilter === 'ALL' ? styles.filterPillActive : ''}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setActiveFilter('PDF')}
                  className={`${styles.filterPill} ${activeFilter === 'PDF' ? styles.filterPillActive : ''}`}
                >
                  PDFs
                </button>
                <button 
                  onClick={() => setActiveFilter('CSV')}
                  className={`${styles.filterPill} ${activeFilter === 'CSV' ? styles.filterPillActive : ''}`}
                >
                  CSVs
                </button>
              </div>
            </div>

            {/* Reports List */}
            <div className={styles.reportsList}>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <div key={report._id || report.title} className={`${styles.reportCard} glass-card`}>
                    <div className={styles.cardHeaderRow}>
                      <div 
                        className={styles.iconBox}
                        style={{ 
                          background: report.fileType === 'PDF' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                          color: report.fileType === 'PDF' ? 'var(--danger)' : 'var(--success)'
                        }}
                      >
                        {report.fileType === 'PDF' ? <FileText size={18} /> : <FileSpreadsheet size={18} />}
                      </div>
                      
                      <div className={styles.badgeRow}>
                        <span className={styles.generatedBadge}>By: {report.generatedBy || 'system'}</span>
                        <span className={styles.fileTypeBadge}>{report.fileType}</span>
                      </div>
                    </div>

                    <h4 className={styles.reportTitle}>{report.title}</h4>
                    <p className={styles.reportDesc}>{report.description}</p>

                    <div className={styles.cardFooter}>
                      <span className={styles.metaText}>
                        Compiled: {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDownloadReport(report._id, report.title, report.fileType)}
                        disabled={downloading}
                        className={styles.downloadBtn}
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noReports}>
                  No reports found matching your search criteria.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
