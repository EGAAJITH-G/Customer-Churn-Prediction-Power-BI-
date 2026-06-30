import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import { 
  Filter, 
  RefreshCcw, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Percent, 
  Monitor
} from 'lucide-react';
import styles from './PowerBI.module.css';

const PowerBI = () => {
  // Power BI Tab Page State: 'Analytics Overview', 'Service Demographics', 'Prediction Insights'
  const [activePBIPage, setActivePBIPage] = useState('Analytics Overview');

  // Filter states (Slicers)
  const [regionFilter, setRegionFilter] = useState('All');
  const [contractFilter, setContractFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Top Ribbon Menu Interactive States
  const [activeRibbonTab, setActiveRibbonTab] = useState('Home');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [powerBiTheme, setPowerBiTheme] = useState('default');

  // Modal Overlay States
  const [quickMeasureOpen, setQuickMeasureOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);

  // Core metrics state that recalculates based on filters
  const [metrics, setMetrics] = useState({
    totalSubscribers: 7043,
    avgChurnRisk: 26.5,
    revenueAtRisk: 59840,
    retentionRate: 73.5
  });

  // Chart data states (Tab 1: Analytics Overview)
  const [tenureData, setTenureData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  // Chart data states (Tab 2: Service Demographics)
  const [paymentData, setPaymentData] = useState([]);
  const [partnerData, setPartnerData] = useState([]);

  // Chart data states (Tab 3: Prediction Insights)
  const [driversData, setDriversData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);

  // Theme configuration definition
  const themes = {
    default: {
      canvasBg: '#F3F2F1',
      cardBg: '#ffffff',
      cardBorder: '#e0e0e0',
      text: '#111111',
      textLight: '#605e5c',
      chartActive: '#2563EB',
      chartChurn: '#EF4444',
      chartTrend: '#7C3AED',
      chartAccent: '#06B6D4'
    },
    dark: {
      canvasBg: '#1f1f1f',
      cardBg: '#2d2d2d',
      cardBorder: '#454545',
      text: '#ffffff',
      textLight: '#b3b3b3',
      chartActive: '#3b82f6',
      chartChurn: '#ef4444',
      chartTrend: '#a855f7',
      chartAccent: '#14b8a6'
    },
    teal: {
      canvasBg: '#f0f7f7',
      cardBg: '#ffffff',
      cardBorder: '#cce2e2',
      text: '#0f3d3d',
      textLight: '#4d8080',
      chartActive: '#0d9488',
      chartChurn: '#f43f5e',
      chartTrend: '#0f766e',
      chartAccent: '#06b6d4'
    },
    contrast: {
      canvasBg: '#000000',
      cardBg: '#000000',
      cardBorder: '#ffff00',
      text: '#ffffff',
      textLight: '#ffff00',
      chartActive: '#ffffff',
      chartChurn: '#ffff00',
      chartTrend: '#00ffff',
      chartAccent: '#ffffff'
    }
  };

  const currentTheme = themes[powerBiTheme] || themes.default;

  // Base Data Model for recalculation simulation
  const calculateData = () => {
    // Determine scaling factor based on region
    let scale = 1.0;
    let baseChurn = 26.5;
    let baseRevRisk = 59840;
    
    if (regionFilter === 'North') { scale = 0.26; baseChurn = 28.2; baseRevRisk = 16200; }
    else if (regionFilter === 'South') { scale = 0.23; baseChurn = 24.1; baseRevRisk = 12900; }
    else if (regionFilter === 'East') { scale = 0.25; baseChurn = 25.8; baseRevRisk = 14800; }
    else if (regionFilter === 'West') { scale = 0.26; baseChurn = 27.5; baseRevRisk = 15940; }

    // Adjust based on contract filter
    let contractScale = 1.0;
    if (contractFilter === 'Month-to-month') {
      baseChurn = Math.min(92, baseChurn * 1.6);
      contractScale = 0.55;
      baseRevRisk = baseRevRisk * 1.3 * contractScale;
    } else if (contractFilter === 'One year') {
      baseChurn = Math.max(5, baseChurn * 0.45);
      contractScale = 0.25;
      baseRevRisk = baseRevRisk * 0.5 * contractScale;
    } else if (contractFilter === 'Two year') {
      baseChurn = Math.max(1, baseChurn * 0.12);
      contractScale = 0.20;
      baseRevRisk = baseRevRisk * 0.15 * contractScale;
    }

    const subs = Math.round(7043 * scale * (contractFilter === 'All' ? 1.0 : contractScale));
    const churnRisk = parseFloat(baseChurn.toFixed(1));
    const revRisk = Math.round(baseRevRisk);
    const retention = parseFloat((100 - churnRisk).toFixed(1));

    setMetrics({
      totalSubscribers: subs,
      avgChurnRisk: churnRisk,
      revenueAtRisk: revRisk,
      retentionRate: retention
    });

    // 1. Generate Tenure Chart Data (Tab 1)
    const baseTenure = [
      { name: '< 6 Mos', active: 820, churned: 380 },
      { name: '6-12 Mos', active: 940, churned: 260 },
      { name: '1-2 Yrs', active: 1450, churned: 190 },
      { name: '2-4 Yrs', active: 1890, churned: 110 },
      { name: '4+ Yrs', active: 2200, churned: 40 }
    ];
    setTenureData(baseTenure.map(item => ({
      name: item.name,
      'Active Users': Math.round(item.active * scale * (contractFilter === 'All' ? 1.0 : contractScale)),
      'Churned Users': Math.round(item.churned * scale * (contractFilter === 'All' ? 1.4 : contractScale * 0.6))
    })));

    // 2. Generate Service Type Donut Data (Tab 1)
    const colors = [currentTheme.chartActive, currentTheme.chartTrend, currentTheme.chartAccent];
    const baseService = [
      { name: 'Fiber Optic', value: 3100 },
      { name: 'DSL', value: 2400 },
      { name: 'No Internet', value: 1543 }
    ];
    setServiceData(baseService.map((item, idx) => ({
      name: item.name,
      value: Math.round(item.value * scale * (contractFilter === 'All' ? 1.0 : contractScale)),
      color: colors[idx]
    })));

    // 3. Generate Monthly Trend Data (Tab 1)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trendBase = [24, 25, 23, 27, 26, churnRisk];
    setTrendData(months.map((m, idx) => ({
      month: m,
      'Churn Rate (%)': parseFloat((trendBase[idx] * (regionFilter === 'All' ? 1.0 : 0.95 + idx * 0.01)).toFixed(1))
    })));

    // 4. Generate Payment Method Loyalty Data (Tab 2)
    const basePayment = [
      { name: 'Electronic Check', active: 1100, churned: 800 },
      { name: 'Mailed Check', active: 1300, churned: 300 },
      { name: 'Bank Transfer', active: 1400, churned: 150 },
      { name: 'Credit Card', active: 1450, churned: 100 }
    ];
    setPaymentData(basePayment.map(item => ({
      name: item.name,
      'Active Users': Math.round(item.active * scale * (contractFilter === 'All' ? 1.0 : contractScale)),
      'Churned Users': Math.round(item.churned * scale * (contractFilter === 'All' ? 1.3 : contractScale * 0.5))
    })));

    // 5. Generate Household Demographics Data (Tab 2)
    const basePartner = [
      { name: 'Single / No Dep.', active: 1800, churned: 700 },
      { name: 'Has Partner Only', active: 1600, churned: 350 },
      { name: 'Has Dependents Only', active: 800, churned: 120 },
      { name: 'Partner & Dependents', active: 1500, churned: 100 }
    ];
    setPartnerData(basePartner.map(item => ({
      name: item.name,
      'Active Users': Math.round(item.active * scale * (contractFilter === 'All' ? 1.0 : contractScale)),
      'Churned Users': Math.round(item.churned * scale * (contractFilter === 'All' ? 1.2 : contractScale * 0.6))
    })));

    // 6. Generate Key Churn Drivers Data (Tab 3)
    const baseDrivers = [
      { name: 'Month-to-Month Contract', impact: 38 },
      { name: 'Electronic Check Payment', impact: 22 },
      { name: 'Fiber Optic Internet', impact: 15 },
      { name: 'No Tech Support Bundle', impact: 12 },
      { name: 'Senior Citizen Status', impact: 8 }
    ];
    setDriversData(baseDrivers.map(item => ({
      name: item.name,
      'Impact Weight (%)': Math.max(2, Math.round(item.impact * (regionFilter === 'North' ? 1.1 : regionFilter === 'South' ? 0.9 : 1.0) * (contractFilter === 'Month-to-month' && item.name.includes('Month') ? 1.5 : 1.0)))
    })));

    // 7. Generate AI Risk Cohort Distribution (Tab 3)
    const baseDistribution = [
      { name: 'Low Risk (<30%)', count: 3200 },
      { name: 'Moderate Risk (30-70%)', count: 1800 },
      { name: 'High Risk (>70%)', count: 2043 }
    ];
    setDistributionData(baseDistribution.map(item => {
      let adjFactor = 1.0;
      if (item.name.includes('High')) {
        adjFactor = contractFilter === 'Month-to-month' ? 1.8 : contractFilter === 'Two year' ? 0.2 : 1.0;
      } else if (item.name.includes('Low')) {
        adjFactor = contractFilter === 'Two year' ? 1.4 : contractFilter === 'Month-to-month' ? 0.4 : 1.0;
      }
      return {
        name: item.name,
        'Subscriber Count': Math.round(item.count * scale * adjFactor)
      };
    }));
  };

  useEffect(() => {
    calculateData();
  }, [regionFilter, contractFilter, powerBiTheme]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleClose = () => setActiveDropdown(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      calculateData();
      setIsRefreshing(false);
    }, 800);
  };

  const handleResetFilters = () => {
    setRegionFilter('All');
    setContractFilter('All');
  };

  // PDF Export flow
  const handleExportPDF = () => {
    setPdfExporting(true);
    setActiveDropdown(null);
    setTimeout(() => {
      setPdfExporting(false);
      window.print();
    }, 1500);
  };

  // Raw CSV Download flow
  const handleDownloadDataset = () => {
    let csvContent = "data:text/csv;charset=utf-8,CustomerId,Gender,SeniorCitizen,Partner,Dependents,Tenure,PhoneService,MultipleLines,InternetService,Contract,MonthlyCharges,TotalCharges,Churn\n";
    const mockRows = [
      ["CUST001", "Female", 0, "Yes", "No", 12, "Yes", "No", "Fiber optic", "Month-to-month", 78.50, 942.00, "Yes"],
      ["CUST002", "Male", 0, "No", "No", 34, "Yes", "Yes", "DSL", "One year", 56.75, 1929.50, "No"],
      ["CUST003", "Male", 1, "No", "No", 2, "Yes", "No", "Fiber optic", "Month-to-month", 80.85, 161.70, "Yes"],
      ["CUST004", "Female", 0, "Yes", "Yes", 62, "Yes", "Yes", "Fiber optic", "Two year", 105.40, 6534.80, "No"],
      ["CUST005", "Female", 0, "No", "No", 8, "Yes", "No", "DSL", "Month-to-month", 45.30, 362.40, "Yes"],
      ["CUST006", "Male", 0, "Yes", "No", 48, "Yes", "Yes", "Fiber optic", "One year", 95.90, 4603.20, "No"],
      ["CUST007", "Female", 0, "No", "No", 1, "No", "No phone service", "DSL", "Month-to-month", 29.85, 29.85, "Yes"],
      ["CUST008", "Male", 0, "Yes", "Yes", 72, "Yes", "Yes", "Fiber optic", "Two year", 115.80, 8337.60, "No"],
      ["CUST009", "Female", 0, "Yes", "No", 18, "Yes", "No", "No", "Month-to-month", 20.15, 362.70, "No"],
      ["CUST010", "Male", 1, "Yes", "No", 24, "Yes", "Yes", "Fiber optic", "Month-to-month", 94.20, 2260.80, "Yes"]
    ];
    mockRows.forEach(r => {
      csvContent += r.join(",") + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "churnpredict_raw_dataset.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActiveDropdown(null);
  };

  const renderDropdown = (tab) => {
    switch (tab) {
      case 'File':
        return (
          <div className={styles.dropdownMenu}>
            <button onClick={handleExportPDF} className={styles.dropdownItem}>
              <span>📄 Export Report to PDF</span>
            </button>
            <button onClick={handleDownloadDataset} className={styles.dropdownItem}>
              <span>📥 Download Raw Dataset (.csv)</span>
            </button>
            <button onClick={handleResetFilters} className={styles.dropdownItem}>
              <span>🔄 Reset All Slicers</span>
            </button>
          </div>
        );
      case 'Insert':
        return (
          <div className={styles.dropdownMenu}>
            <button onClick={() => { alert('Smart Narrative Visual added to report canvas.'); setActiveDropdown(null); }} className={styles.dropdownItem}>
              <span>📝 Add Smart Narrative Text</span>
            </button>
            <button onClick={() => { alert('Key Influencers Visual activated.'); setActiveDropdown(null); }} className={styles.dropdownItem}>
              <span>🔍 Add Key Influencers Card</span>
            </button>
            <button onClick={() => { alert('New Shape element inserted.'); setActiveDropdown(null); }} className={styles.dropdownItem}>
              <span>📐 Add Shape / Divider</span>
            </button>
          </div>
        );
      case 'Modeling':
        return (
          <div className={styles.dropdownMenu}>
            <button onClick={() => { setQuickMeasureOpen(true); setActiveDropdown(null); }} className={styles.dropdownItem}>
              <span>➕ Create Quick Measure</span>
            </button>
            <button onClick={() => { alert('Calculated column [Tenure_Years] added to model.'); setActiveDropdown(null); }} className={styles.dropdownItem}>
              <span>📊 New Calculated Column</span>
            </button>
            <button onClick={() => { alert('Calculated table [High_Risk_Subscribers] generated.'); setActiveDropdown(null); }} className={styles.dropdownItem}>
              <span>📋 New Calculated Table</span>
            </button>
          </div>
        );
      case 'View':
        return (
          <div className={styles.dropdownMenu}>
            <div className={styles.dropdownSectionTitle}>Report Themes</div>
            <button onClick={() => { setPowerBiTheme('default'); setActiveDropdown(null); }} className={`${styles.dropdownItem} ${powerBiTheme === 'default' ? styles.themeActive : ''}`}>
              <span>🔵 Classic Blue (Default)</span>
            </button>
            <button onClick={() => { setPowerBiTheme('dark'); setActiveDropdown(null); }} className={`${styles.dropdownItem} ${powerBiTheme === 'dark' ? styles.themeActive : ''}`}>
              <span>🌑 Obsidian Dark Mode</span>
            </button>
            <button onClick={() => { setPowerBiTheme('teal'); setActiveDropdown(null); }} className={`${styles.dropdownItem} ${powerBiTheme === 'teal' ? styles.themeActive : ''}`}>
              <span>🟢 Emerald Teal</span>
            </button>
            <button onClick={() => { setPowerBiTheme('contrast'); setActiveDropdown(null); }} className={`${styles.dropdownItem} ${powerBiTheme === 'contrast' ? styles.themeActive : ''}`}>
              <span>🟡 High Contrast Accessibility</span>
            </button>
          </div>
        );
      case 'Help':
        return (
          <div className={styles.dropdownMenu}>
            <button onClick={() => { setHelpOpen(true); setActiveDropdown(null); }} className={styles.dropdownItem}>
              <span>📖 Power BI User Guide</span>
            </button>
            <button onClick={() => { setAboutOpen(true); setActiveDropdown(null); }} className={styles.dropdownItem}>
              <span>ℹ️ About ChurnPredict Embed</span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* Power BI Top Ribbon Menu */}
      <div className={styles.powerBiHeader}>
        <div className={styles.pbiLeft}>
          <div className={styles.pbiIconWrapper}>
            <Monitor size={14} className={styles.pbiIcon} />
          </div>
          <span className={styles.pbiTitle}>Power BI Desktop - Customer_Churn_Dashboard.pbix</span>
        </div>
        <div className={styles.pbiMenuTabs}>
          {['File', 'Home', 'Insert', 'Modeling', 'View', 'Help'].map(tab => (
            <div key={tab} className={styles.tabContainer}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (tab === 'Home') {
                    setActiveRibbonTab('Home');
                    setActiveDropdown(null);
                    handleResetFilters();
                    setActivePBIPage('Analytics Overview');
                  } else {
                    setActiveDropdown(activeDropdown === tab ? null : tab);
                  }
                }}
                className={`${styles.menuTab} ${activeRibbonTab === tab || activeDropdown === tab ? styles.activeTab : ''}`}
              >
                {tab}
              </button>
              
              {activeDropdown === tab && renderDropdown(tab)}
            </div>
          ))}
        </div>
      </div>

      {/* Embedded canvas area */}
      <div className={styles.canvasContainer}>
        {/* Slicers Sidebar Panel (Filters) */}
        <aside className={styles.slicerSidebar}>
          <div className={styles.sidebarHeader}>
            <Filter size={14} />
            <h3>Report Slicers</h3>
          </div>

          {/* Region Slicer */}
          <div className={styles.slicerBox}>
            <label className={styles.slicerLabel}>Region Selector</label>
            <div className={styles.radioGroup}>
              {['All', 'North', 'South', 'East', 'West'].map(region => (
                <button
                  key={region}
                  onClick={() => setRegionFilter(region)}
                  className={`${styles.filterBtn} ${regionFilter === region ? styles.filterBtnActive : ''}`}
                >
                  {region} Region
                </button>
              ))}
            </div>
          </div>

          {/* Contract Slicer */}
          <div className={styles.slicerBox}>
            <label className={styles.slicerLabel}>Contract Duration</label>
            <div className={styles.radioGroup}>
              {['All', 'Month-to-month', 'One year', 'Two year'].map(contract => (
                <button
                  key={contract}
                  onClick={() => setContractFilter(contract)}
                  className={`${styles.filterBtn} ${contractFilter === contract ? styles.filterBtnActive : ''}`}
                >
                  {contract}
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <button onClick={handleResetFilters} className={styles.resetBtn}>
            Reset All Slicers
          </button>

          <div className={styles.slicerFooter}>
            <button onClick={handleRefresh} disabled={isRefreshing} className={styles.refreshBtn}>
              <RefreshCcw size={13} className={isRefreshing ? styles.spin : ''} />
              <span>{isRefreshing ? 'Recalculating...' : 'Refresh Live Dataset'}</span>
            </button>
          </div>
        </aside>

        {/* Dashboard Report View Canvas */}
        <main className={styles.reportCanvas} style={{ background: currentTheme.canvasBg }}>
          {/* Top KPI row */}
          <div className={styles.kpiRow}>
            {/* Card 1 */}
            <div className={styles.kpiCard} style={{ background: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
              <div className={styles.cardHeaderRow}>
                <span className={styles.kpiLabel} style={{ color: currentTheme.textLight }}>Subscribers count</span>
                <Users size={14} className={styles.kpiIconBlue} />
              </div>
              <div className={styles.kpiValue} style={{ color: currentTheme.text }}>{metrics.totalSubscribers.toLocaleString()}</div>
              <span className={styles.kpiFootnote} style={{ color: currentTheme.textLight }}>Total Filtered Subscribers</span>
            </div>

            {/* Card 2 */}
            <div className={styles.kpiCard} style={{ background: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
              <div className={styles.cardHeaderRow}>
                <span className={styles.kpiLabel} style={{ color: currentTheme.textLight }}>Average Churn Risk</span>
                <Percent size={14} className={styles.kpiIconRed} />
              </div>
              <div className={styles.kpiValue} style={{ color: currentTheme.text }}>{metrics.avgChurnRisk}%</div>
              <span className={styles.kpiFootnote} style={{ color: currentTheme.textLight }}>Weighted Prob. Score</span>
            </div>

            {/* Card 3 */}
            <div className={styles.kpiCard} style={{ background: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
              <div className={styles.cardHeaderRow}>
                <span className={styles.kpiLabel} style={{ color: currentTheme.textLight }}>Monthly Revenue at Risk</span>
                <DollarSign size={14} className={styles.kpiIconOrange} />
              </div>
              <div className={styles.kpiValue} style={{ color: currentTheme.text }}>${metrics.revenueAtRisk.toLocaleString()}</div>
              <span className={styles.kpiFootnote} style={{ color: currentTheme.textLight }}>Potential MRC Impact</span>
            </div>

            {/* Card 4 */}
            <div className={styles.kpiCard} style={{ background: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
              <div className={styles.cardHeaderRow}>
                <span className={styles.kpiLabel} style={{ color: currentTheme.textLight }}>Active Retention Rate</span>
                <TrendingUp size={14} className={styles.kpiIconGreen} />
              </div>
              <div className={styles.kpiValue} style={{ color: currentTheme.text }}>{metrics.retentionRate}%</div>
              <span className={styles.kpiFootnote} style={{ color: currentTheme.textLight }}>Loyalty Index Rating</span>
            </div>
          </div>

          {/* Grid visual charts based on Active PBIPage tab */}
          {activePBIPage === 'Analytics Overview' && (
            <div className={styles.chartsGrid}>
              {/* Chart 1: Bar Chart */}
              <div className={styles.chartCard} style={{ background: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
                <h4 className={styles.chartTitle} style={{ color: currentTheme.text }}>Tenure Bracket Churn Analytics</h4>
                <div style={{ width: '100%', height: 230 }}>
                  <ResponsiveContainer>
                    <BarChart data={tenureData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke={currentTheme.textLight} fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke={currentTheme.textLight} fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: currentTheme.cardBg, borderRadius: '8px', border: `1px solid ${currentTheme.cardBorder}`, fontSize: '11px', color: currentTheme.text }} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                      <Bar dataKey="Active Users" fill={currentTheme.chartActive} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Churned Users" fill={currentTheme.chartChurn} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Donut Chart */}
              <div className={styles.chartCard} style={{ background: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
                <h4 className={styles.chartTitle} style={{ color: currentTheme.text }}>Internet Service Risk Share</h4>
                <div style={{ width: '100%', height: 230, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '60%', height: '100%' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={serviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {serviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toLocaleString()} Users`} contentStyle={{ background: currentTheme.cardBg, color: currentTheme.text, fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.pieLegend}>
                    {serviceData.map(item => (
                      <div key={item.name} className={styles.legendItem}>
                        <span className={styles.legendColorDot} style={{ background: item.color }} />
                        <div className={styles.legendDetails}>
                          <span className={styles.legendName} style={{ color: currentTheme.text }}>{item.name}</span>
                          <span className={styles.legendVal} style={{ color: currentTheme.textLight }}>{item.value.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart 3: Line/Area Chart */}
              <div className={styles.chartCard} style={{ gridColumn: 'span 2', background: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
                <h4 className={styles.chartTitle} style={{ color: currentTheme.text }}>Active Month-Over-Month Churn Trend</h4>
                <div style={{ width: '100%', height: 210 }}>
                  <ResponsiveContainer>
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={currentTheme.chartTrend} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={currentTheme.chartTrend} stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke={currentTheme.textLight} fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke={currentTheme.textLight} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: currentTheme.cardBg, color: currentTheme.text, fontSize: '11px' }} />
                      <Area type="monotone" dataKey="Churn Rate (%)" stroke={currentTheme.chartTrend} strokeWidth={2.5} fillOpacity={1} fill="url(#colorChurn)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activePBIPage === 'Service Demographics' && (
            <div className={styles.chartsGrid}>
              {/* Chart 1: Payment Loyalty Chart */}
              <div className={styles.chartCard} style={{ gridColumn: 'span 2', background: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
                <h4 className={styles.chartTitle} style={{ color: currentTheme.text }}>Payment Method & Subscriber Loyalty</h4>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer>
                    <BarChart data={paymentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke={currentTheme.textLight} fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke={currentTheme.textLight} fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: currentTheme.cardBg, borderRadius: '8px', border: `1px solid ${currentTheme.cardBorder}`, fontSize: '11px', color: currentTheme.text }} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                      <Bar dataKey="Active Users" fill={currentTheme.chartAccent} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Churned Users" fill={currentTheme.chartChurn} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Household Profile stack chart */}
              <div className={styles.chartCard} style={{ background: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
                <h4 className={styles.chartTitle} style={{ color: currentTheme.text }}>Household Profile Demographics</h4>
                <div style={{ width: '100%', height: 230 }}>
                  <ResponsiveContainer>
                    <BarChart data={partnerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke={currentTheme.textLight} fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke={currentTheme.textLight} fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: currentTheme.cardBg, color: currentTheme.text, fontSize: '11px' }} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                      <Bar dataKey="Active Users" fill={currentTheme.chartTrend} stackId="a" />
                      <Bar dataKey="Churned Users" fill={currentTheme.chartActive} stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Contract Segment Insights */}
              <div className={styles.chartCard} style={{ background: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
                <h4 className={styles.chartTitle} style={{ color: currentTheme.text }}>Contract Distribution Share</h4>
                <div style={{ width: '100%', height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: currentTheme.text, fontFamily: 'var(--font-heading)' }}>
                    {contractFilter === 'All' ? 'Mixed Portfolio' : contractFilter}
                  </div>
                  <div style={{ fontSize: '12px', color: currentTheme.textLight, fontWeight: 600, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Active Segment Duration Filter
                  </div>
                  <p style={{ fontSize: '11.5px', color: currentTheme.textLight, textAlign: 'center', margin: '16px 12px 0 12px', lineHeight: 1.4, fontWeight: 500 }}>
                    {contractFilter === 'All' && 'Month-to-month contracts constitute 55% of overall churn risk. Transitioning to 1-Year or 2-Year loyalty terms lowers absolute risk by up to 80%.'}
                    {contractFilter === 'Month-to-month' && 'HIGH VOLATILITY SEGMENT. Month-to-month contracts have a 92% historical churn risk index. Implement active discount incentives immediately.'}
                    {contractFilter === 'One year' && 'STABLE SEGMENT. One year contract lock-ins exhibit strong loyalty indexes (under 12% churn risk weight).'}
                    {contractFilter === 'Two year' && 'ULTRA-LOYAL SEGMENT. Two year contract holders represent long-term recurring revenue with near-zero attrition indicators.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activePBIPage === 'Prediction Insights' && (
            <div className={styles.chartsGrid}>
              {/* Chart 1: Key Drivers horizontal chart */}
              <div className={styles.chartCard} style={{ background: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
                <h4 className={styles.chartTitle} style={{ color: currentTheme.text }}>AI Model Key Churn Drivers</h4>
                <div style={{ width: '100%', height: 230 }}>
                  <ResponsiveContainer>
                    <BarChart 
                      data={driversData} 
                      layout="vertical"
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <XAxis type="number" stroke={currentTheme.textLight} fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke={currentTheme.textLight} fontSize={8} width={120} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: currentTheme.cardBg, color: currentTheme.text, fontSize: '11px' }} />
                      <Bar dataKey="Impact Weight (%)" fill={currentTheme.chartActive} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Cohort risk area chart */}
              <div className={styles.chartCard} style={{ background: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
                <h4 className={styles.chartTitle} style={{ color: currentTheme.text }}>AI Risk Cohort Distribution</h4>
                <div style={{ width: '100%', height: 230 }}>
                  <ResponsiveContainer>
                    <AreaChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={currentTheme.chartActive} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={currentTheme.chartActive} stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke={currentTheme.textLight} fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke={currentTheme.textLight} fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: currentTheme.cardBg, color: currentTheme.text, fontSize: '11px' }} />
                      <Area type="monotone" dataKey="Subscriber Count" stroke={currentTheme.chartActive} strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Model Metrics list */}
              <div className={styles.chartCard} style={{ gridColumn: 'span 2', background: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
                <h4 className={styles.chartTitle} style={{ color: currentTheme.text }}>ChurnPredict AI Model Metrics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '12px 0' }}>
                  <div style={{ background: currentTheme.canvasBg, border: `1px solid ${currentTheme.cardBorder}`, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: currentTheme.textLight, fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Model Name</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: currentTheme.text }}>XGBoost Classifier</div>
                  </div>
                  <div style={{ background: currentTheme.canvasBg, border: `1px solid ${currentTheme.cardBorder}`, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: currentTheme.textLight, fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Area Under ROC</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--success)' }}>0.88 AUC</div>
                  </div>
                  <div style={{ background: currentTheme.canvasBg, border: `1px solid ${currentTheme.cardBorder}`, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: currentTheme.textLight, fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Prediction Recall</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: currentTheme.chartActive }}>84.2%</div>
                  </div>
                  <div style={{ background: currentTheme.canvasBg, border: `1px solid ${currentTheme.cardBorder}`, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: currentTheme.textLight, fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Last Retrained</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: currentTheme.text }}>24 Hours Ago</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Embedded footer status bar */}
      <footer className={styles.powerBiFooter}>
        <div className={styles.pbiFooterLeft}>
          {['Analytics Overview', 'Service Demographics', 'Prediction Insights'].map(tab => (
            <span
              key={tab}
              onClick={() => setActivePBIPage(tab)}
              className={activePBIPage === tab ? styles.pbiTabLabelActive : styles.pbiTabLabel}
            >
              {tab}
            </span>
          ))}
        </div>
        <div className={styles.pbiFooterRight}>
          <span>Filter Slicers Active: {regionFilter !== 'All' || contractFilter !== 'All' ? 'YES' : 'NO'}</span>
          <span className={styles.pbiDivider}>|</span>
          <span>100% Embedded Preview</span>
        </div>
      </footer>

      {/* Quick Measure Modal */}
      {quickMeasureOpen && (
        <div className={styles.modalBackdrop} onClick={() => setQuickMeasureOpen(false)}>
          <div className={`${styles.modalCard} glass-card`} onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--heading)' }}>Power BI Quick Measure Calculator</h3>
              <button onClick={() => setQuickMeasureOpen(false)} className={styles.closeBtn}>x</button>
            </div>
            <div style={{ padding: '8px 0' }}>
              <p style={{ fontSize: '12.5px', color: 'var(--text-light)', marginBottom: '16px', lineHeight: 1.4 }}>
                Write a DAX measure formula to compute calculated metrics on the dataset.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Measure Name</label>
                  <input type="text" defaultValue="Targeted_Retention_Rate" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg-secondary)', color: 'var(--heading)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>DAX Expression</label>
                  <textarea 
                    rows={3} 
                    defaultValue={`Targeted_Retention = \nDIVIDE(\n  CALCULATE(COUNT(Subscribers), ChurnRisk = "Low"),\n  COUNT(Subscribers)\n)`}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', fontFamily: 'monospace', resize: 'none', background: 'var(--bg-secondary)', color: 'var(--heading)' }}
                  />
                </div>
                <button 
                  onClick={() => {
                    alert('DAX Measure compiled and registered in the model schema.');
                    setQuickMeasureOpen(false);
                  }}
                  className="btn-primary" 
                  style={{ justifyContent: 'center', marginTop: '8px' }}
                >
                  Compile & Run Measure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help User Guide Modal */}
      {helpOpen && (
        <div className={styles.modalBackdrop} onClick={() => setHelpOpen(false)}>
          <div className={`${styles.modalCard} glass-card`} onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--heading)' }}>Power BI Embed User Guide</h3>
              <button onClick={() => setHelpOpen(false)} className={styles.closeBtn}>x</button>
            </div>
            <div style={{ padding: '8px 0', fontSize: '12.5px', color: 'var(--text)', lineHeight: 1.5 }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--heading)' }}>Interactive Features</h4>
              <ul style={{ paddingLeft: '20px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>Footer Tabs:</strong> Switch between Analytics, Demographics, and AI Insights.</li>
                <li><strong>Report Slicers:</strong> Click region or contract type buttons to recalculate all data dynamically.</li>
                <li><strong>Ribbon Menu:</strong> Access File, Modeling, View, and Help to export reports or switch themes.</li>
              </ul>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--heading)' }}>Keyboard Controls</h4>
              <p style={{ margin: 0, color: 'var(--text-light)' }}>
                Press <code>Ctrl + R</code> to refresh dataset, or click the yellow refresh button in the left panel.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {aboutOpen && (
        <div className={styles.modalBackdrop} onClick={() => setAboutOpen(false)}>
          <div className={`${styles.modalCard} glass-card`} onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--heading)' }}>About ChurnPredict AI Embed</h3>
              <button onClick={() => setAboutOpen(false)} className={styles.closeBtn}>x</button>
            </div>
            <div style={{ padding: '8px 0', fontSize: '12.5px', color: 'var(--text)', lineHeight: 1.5, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <div style={{ width: '48px', height: '48px', background: '#F2C811', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px', color: '#111111' }}>P</div>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--heading)' }}>ChurnPredict AI Dashboard Embed</h4>
              <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', marginBottom: '16px' }}>Version 1.4.2 (React & Recharts Hybrid)</span>
              <p style={{ margin: '0 0 16px 0', textAlign: 'left', color: 'var(--text-light)' }}>
                This component simulates a fully interactive, high-fidelity Microsoft Power BI Desktop embed, allowing customer success managers to slice subscriber telemetries and model drivers in real-time.
              </p>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                © 2026 ChurnPredict AI. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Exporting Loader Overlay */}
      {pdfExporting && (
        <div className={styles.modalBackdrop} style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <RefreshCcw size={32} className={styles.spin} style={{ color: '#F2C811' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--heading)' }}>Exporting Power BI Canvas</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-light)' }}>Formatting report layouts and compilation vectors...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PowerBI;
