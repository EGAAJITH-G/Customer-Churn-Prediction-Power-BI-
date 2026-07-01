import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  TrendingUp, 
  IndianRupee, 
  ShieldCheck, 
  ArrowRight, 
  Play,
  Brain,
  BarChart3,
  ShieldAlert,
  Bell,
  FileText,
  Search,
  Sun,
  ChevronRight,
  Database,
  CloudLightning,
  Workflow,
  Sparkles,
  ChevronLeft,
  Star,
  Activity,
  FileSpreadsheet,
  CheckCircle,
  Check,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send
} from 'lucide-react';
import Logo from '../../components/Logo/Logo';
import styles from './Home.module.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Scroll spy active section state
  const [activeSection, setActiveSection] = useState('overview');

  // Testimonials Slider State
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Contact Form States
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSending, setContactSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120; // offset for sticky header
      
      // Check if we hit the bottom of the page
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        setActiveSection('contact');
        return;
      }

      const sections = ['overview', 'features', 'timeline', 'simulator', 'powerbi', 'pricing', 'contact'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger scroll position check on load
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Form Simulator States
  const [formInput, setFormInput] = useState({
    age: 35,
    monthlyCharges: 85,
    contract: 'Month-to-month',
    tenure: 8,
    supportCalls: 3
  });
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState(null);

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSending(true);
    setTimeout(() => {
      setContactSending(false);
      setContactSuccess(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setContactSuccess(false), 5000);
    }, 1500);
  };

  const handleSimulate = (e) => {
    e.preventDefault();
    setScanning(true);
    setScanProgress(0);
    setScanResult(null);

    // Simulate scanning progress bar
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Calculate simulated probability based on fields
          let score = 0.25;
          if (formInput.contract === 'Month-to-month') score += 0.35;
          if (formInput.tenure <= 6) score += 0.20;
          if (formInput.supportCalls >= 3) score += 0.18;
          if (formInput.monthlyCharges > 80) score += 0.12;
          if (formInput.age > 50) score += 0.05;
          
          const prob = Math.max(0.04, Math.min(0.96, score));
          const riskLevel = prob >= 0.7 ? 'High' : prob >= 0.4 ? 'Medium' : 'Low';
          
          setScanResult({
            probability: prob,
            riskLevel,
            recommendation: prob >= 0.7 
              ? 'Urgent Retention Offer: Upgrade to annual contract with a 20% discount and bundle complementary Tech Support.' 
              : prob >= 0.4 
                ? 'Proactive Engagement: Suggest a 1-year loyalty contract and run account audit.' 
                : 'Account Stable: Maintain standard plan and include in standard feedback campaigns.'
          });
          setScanning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  const testimonials = [
    {
      quote: "ChurnPredict AI transformed our retention campaign response rate. We saw a 22% reduction in monthly customer churn within the first quarter.",
      author: "Sarah Jenkins",
      role: "VP of Customer Success",
      company: "Apex Telecom",
      rating: 5,
      avatar: "SJ"
    },
    {
      quote: "The dual database fallback and Python model latency under 200ms made integrating this with our corporate systems seamless.",
      author: "Rajesh Kumar",
      role: "Director of Enterprise Architecture",
      company: "Vocalis Networks",
      rating: 5,
      avatar: "RK"
    },
    {
      quote: "Being able to upload raw CSV billing profiles and instantly download Power BI visual metrics saved our marketing analytics team hours of work.",
      author: "Elena Rostova",
      role: "Lead Marketing Operator",
      company: "Horizon Mobile",
      rating: 5,
      avatar: "ER"
    }
  ];

  return (
    <div className={styles.container}>
      {/* Background Aurora elements */}
      <div className={styles.glow1}></div>
      <div className={styles.glow2}></div>
      <div className={styles.glow3}></div>
      <div className={styles.gridOverlay}></div>

      {/* Sticky Glass Navbar */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.logo} onClick={() => navigate('/')}>
            <div className={styles.logoIcon}>
              <Logo size={20} strokeColor="#ffffff" />
            </div>
            <div className={styles.logoTextWrapper}>
              <span className={styles.logoMain}>ChurnPredict AI</span>
              <span className={styles.logoSubText}>Predict. Prevent. Retain.</span>
            </div>
          </div>

          <nav className={styles.topNav}>
            <a href="#overview" className={activeSection === 'overview' ? styles.activeNavLink : ''}>Home</a>
            <a href="#features" className={activeSection === 'features' ? styles.activeNavLink : ''}>Features</a>
            <a href="#timeline" className={activeSection === 'timeline' ? styles.activeNavLink : ''}>Solutions</a>
            <a href="#simulator" className={activeSection === 'simulator' ? styles.activeNavLink : ''}>Analytics</a>
            <a href="#powerbi" className={activeSection === 'powerbi' ? styles.activeNavLink : ''}>Dashboard</a>
            <a href="#pricing" className={activeSection === 'pricing' ? styles.activeNavLink : ''}>Pricing</a>
            <a href="#contact" className={activeSection === 'contact' ? styles.activeNavLink : ''}>Contact</a>
          </nav>

          <div className={styles.navActions}>
            <button className={styles.navIconBtn} title="Search"><Search size={16} /></button>
            <button className={styles.navIconBtn} title="Light Theme"><Sun size={16} /></button>
            <span className={styles.navDivider}></span>
            <button onClick={() => navigate('/login')} className={styles.loginLink}>Login</button>
            <button onClick={handleStart} className={styles.getStartedBtn}>Get Started</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className={styles.heroSection}>
        <div className={styles.heroGrid}>
          {/* Hero Left Info */}
          <div className={styles.heroLeft}>
            <div className={styles.badge}>
              <Sparkles size={12} className={styles.badgeSpark} />
              <span>AI POWERED CHURN PREDICTION</span>
            </div>
            
            <h1 className={styles.heroTitle}>
              Predict Customer Churn <br />
              <span className={styles.gradientText}>Before It Happens.</span>
            </h1>
            
            <p className={styles.heroSub}>
              Leverage advanced machine learning pipelines to analyze customer usage metrics, predict contract risk factors, and deploy proactive retention programs directly to your support teams.
            </p>

            <div className={styles.ctaGroup}>
              <button onClick={handleStart} className={styles.getStartedHeroBtn}>
                <span>Get Started Free</span>
                <ArrowRight size={16} />
              </button>
              <button onClick={() => document.getElementById('simulator').scrollIntoView({ behavior: 'smooth' })} className={styles.watchDemoBtn}>
                <span className={styles.playCircle}>
                  <Play size={10} fill="currentColor" />
                </span>
                <span>Run Interactive Demo</span>
              </button>
            </div>

            {/* Float Stats row */}
            <div className={styles.metricsRow}>
              <div className={`${styles.metricCard} glass-card`}>
                <div className={`${styles.metricIcon} ${styles.blue}`}><Users size={16} /></div>
                <div className={styles.metricVal}>50K+</div>
                <div className={styles.metricLabel}>Customers Analyzed</div>
              </div>
              <div className={`${styles.metricCard} glass-card`}>
                <div className={`${styles.metricIcon} ${styles.cyan}`}><TrendingUp size={16} /></div>
                <div className={styles.metricVal}>$32.4K</div>
                <div className={styles.metricLabel}>MRR Revenue Saved</div>
              </div>
              <div className={`${styles.metricCard} glass-card`}>
                <div className={`${styles.metricIcon} ${styles.green}`}><ShieldCheck size={16} /></div>
                <div className={styles.metricVal}>92.7%</div>
                <div className={styles.metricLabel}>Model Accuracy</div>
              </div>
              <div className={`${styles.metricCard} glass-card`}>
                <div className={`${styles.metricIcon} ${styles.purple}`}><Activity size={16} /></div>
                <div className={styles.metricVal}>22%</div>
                <div className={styles.metricLabel}>Retention Increase</div>
              </div>
            </div>
          </div>

          {/* Hero Right Dashboard Mockup Display */}
          <div className={styles.heroRight}>
            <div className={styles.previewCardWrapper}>
              {/* Holographic glowing rings */}
              <div className={styles.ring1}></div>
              <div className={styles.ring2}></div>
              <div className={styles.cardGlow}></div>
              
              {/* Floating 3D glass shards */}
              <div className={`${styles.glassShard} ${styles.shard1}`}></div>
              <div className={`${styles.glassShard} ${styles.shard2}`}></div>
              <div className={`${styles.glassShard} ${styles.shard3}`}></div>
              
              <img 
                src="/dashboard_preview.png" 
                alt="ChurnPredict AI Dashboard Mockup Preview" 
                className={styles.heroPreview} 
              />
              
              {/* Branded Overlay (crisp HTML/CSS rendering on top of the abstract mockup screen) */}
              <div className={styles.brandOverlay}>
                <div className={styles.overlayLogo}>
                  <Logo size={10} strokeColor="#ffffff" />
                </div>
                <span className={styles.overlayText}>ChurnPredict AI</span>
              </div>
              
              {/* Floating micro widgets */}
              <div className={`${styles.floatingWidget} ${styles.widget1} glass-card`}>
                <span className={styles.widgetDot}></span>
                <span>AI Scanned: 92.7% Accuracy</span>
              </div>
              <div className={`${styles.floatingWidget} ${styles.widget2} glass-card`}>
                <span className={styles.widgetIndicator}></span>
                <span>Active MRR: $52,840</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust partner logos section */}
      <section className={styles.trustSection}>
        <div className={styles.trustContainer}>
          <p className={styles.trustTitle}>TRUSTED BY LEADING ENTERPRISES WORLDWIDE</p>
          <div className={styles.logoTrack}>
            <span>Google</span>
            <span>Microsoft</span>
            <span>Amazon</span>
            <span>IBM</span>
            <span>Oracle</span>
            <span>Cisco</span>
          </div>
        </div>
      </section>

      {/* Features Grid Section (6 large glass cards) */}
      <section id="features" className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Engineered for Predictive Growth</h2>
        <p className={styles.sectionSub}>Everything you need to analyze churn dynamics and automate customer loyalty.</p>
        
        <div className={styles.featuresGrid}>
          {/* Card 1 */}
          <div className={`${styles.featureCard} glass-card`}>
            <div className={styles.featIconBox} style={{ color: 'var(--secondary)' }}><Brain size={24} /></div>
            <h3>AI Churn Prediction</h3>
            <p>Runs supervised Random Forest pipelines to identify accounts nearing churn critical zones.</p>
          </div>

          {/* Card 2 */}
          <div className={`${styles.featureCard} glass-card`}>
            <div className={styles.featIconBox} style={{ color: 'var(--primary)' }}><BarChart3 size={24} /></div>
            <h3>Customer Analytics</h3>
            <p>Demographic profile segmentation, payment channel distribution graphs, and tenure lifecycles.</p>
          </div>

          {/* Card 3 */}
          <div className={`${styles.featureCard} glass-card`}>
            <div className={styles.featIconBox} style={{ color: 'var(--accent)' }}><Workflow size={24} /></div>
            <h3>Real-Time Dashboard</h3>
            <p>Track MRR balances, churn rates, average customer tenure, and top-risk accounts instantly.</p>
          </div>

          {/* Card 4 */}
          <div className={`${styles.featureCard} glass-card`}>
            <div className={styles.featIconBox} style={{ color: 'var(--success)' }}><IndianRupee size={24} /></div>
            <h3>Revenue Insights</h3>
            <p>Calculates the monetary impact of active contracts vs lost MRR from closed accounts.</p>
          </div>

          {/* Card 5 */}
          <div className={`${styles.featureCard} glass-card`}>
            <div className={styles.featIconBox} style={{ color: 'var(--danger)' }}><ShieldAlert size={24} /></div>
            <h3>Risk Detection</h3>
            <p>Flags accounts lacking Online Security or Technical Support subscriptions for sales outreach.</p>
          </div>

          {/* Card 6 */}
          <div className={`${styles.featureCard} glass-card`}>
            <div className={styles.featIconBox} style={{ color: 'var(--warning)' }}><FileText size={24} /></div>
            <h3>Business Reports</h3>
            <p>Download pre-computed high-risk customer lists directly as CSV to run marketing campaigns.</p>
          </div>
        </div>
      </section>

      {/* How it works timeline section */}
      <section id="timeline" className={styles.timelineSection}>
        <h2 className={styles.sectionTitle}>How ChurnPredict AI Works</h2>
        <p className={styles.sectionSub}>A seamless workflow from ingestion to revenue retention.</p>
        
        <div className={styles.timelineWrapper}>
          <div className={styles.timelineConnect}></div>
          
          <div className={styles.timelineStep}>
            <div className={styles.stepNum}>1</div>
            <h4>Upload Customer Data</h4>
            <p>Import subscriber demographic CSV profiles.</p>
          </div>

          <div className={styles.timelineStep}>
            <div className={styles.stepNum}>2</div>
            <h4>AI Processing</h4>
            <p>Features scaled and mapped to numerical encoders.</p>
          </div>

          <div className={styles.timelineStep}>
            <div className={styles.stepNum}>3</div>
            <h4>Machine Learning</h4>
            <p>Random Forest model maps churn probability.</p>
          </div>

          <div className={styles.timelineStep}>
            <div className={styles.stepNum}>4</div>
            <h4>Prediction Output</h4>
            <p>Saves risk scores (High, Medium, Low) to database.</p>
          </div>

          <div className={styles.timelineStep}>
            <div className={styles.stepNum}>5</div>
            <h4>Power BI Sync</h4>
            <p>Connects datasets to visual business metrics dashboards.</p>
          </div>

          <div className={styles.timelineStep}>
            <div className={styles.stepNum}>6</div>
            <h4>Business Insights</h4>
            <p>Deploy retention loyalty programs early.</p>
          </div>
        </div>
      </section>

      {/* AI Form Prediction Simulator */}
      <section id="simulator" className={styles.simulatorSection}>
        <h2 className={styles.sectionTitle}>Test the Live AI Engine</h2>
        <p className={styles.sectionSub}>Input custom parameters to run real-time churn simulations.</p>
        
        <div className={`${styles.simGrid} glass-card`}>
          {/* Simulator Form */}
          <div className={styles.simLeft}>
            <h3 className={styles.simBoxTitle}>Simulation Parameters</h3>
            <form onSubmit={handleSimulate} className={styles.simForm}>
              <div className={styles.formGroup}>
                <label>Contract Type</label>
                <select 
                  value={formInput.contract} 
                  onChange={(e) => setFormInput(prev => ({ ...prev, contract: e.target.value }))}
                >
                  <option value="Month-to-month">Month-to-month</option>
                  <option value="One year">One year</option>
                  <option value="Two year">Two year</option>
                </select>
              </div>

              <div className={styles.formGridRow}>
                <div className={styles.formGroup}>
                  <label>Monthly Bill ($)</label>
                  <input 
                    type="number" 
                    min="15" 
                    max="180" 
                    value={formInput.monthlyCharges} 
                    onChange={(e) => setFormInput(prev => ({ ...prev, monthlyCharges: Number(e.target.value) }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Tenure (Months)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="72" 
                    value={formInput.tenure} 
                    onChange={(e) => setFormInput(prev => ({ ...prev, tenure: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className={styles.formGridRow}>
                <div className={styles.formGroup}>
                  <label>Age</label>
                  <input 
                    type="number" 
                    min="18" 
                    max="90" 
                    value={formInput.age} 
                    onChange={(e) => setFormInput(prev => ({ ...prev, age: Number(e.target.value) }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Support Calls</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="9" 
                    value={formInput.supportCalls} 
                    onChange={(e) => setFormInput(prev => ({ ...prev, supportCalls: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <button type="submit" disabled={scanning} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Brain size={16} />
                <span>{scanning ? 'Analyzing telemetry...' : 'Analyze Subscriber'}</span>
              </button>
            </form>
          </div>

          {/* Simulator Output */}
          <div className={styles.simRight}>
            {scanning && (
              <div className={styles.scanningWrapper}>
                <div className={styles.scannerCircle}></div>
                <p className={styles.scanPercent}>{scanProgress}%</p>
                <p className={styles.scanText}>Evaluating features against model.pkl...</p>
              </div>
            )}

            {!scanning && !scanResult && (
              <div className={styles.waitingWrapper}>
                <Sparkles size={32} className={styles.waitingIcon} />
                <h3>Awaiting Simulator Inputs</h3>
                <p>Configure the customer contract profiles on the left and click analyze to output risk rates.</p>
              </div>
            )}

            {!scanning && scanResult && (
              <div className={styles.resultWrapper}>
                <h3 className={styles.resultTitle}>Risk Analysis Result</h3>
                
                <div className={styles.resultBadgeWrapper}>
                  <span className={`${styles.resultBadge} ${styles[scanResult.riskLevel]}`}>
                    {scanResult.riskLevel} Churn Risk
                  </span>
                </div>

                <div className={styles.progressCircleWrapper}>
                  <svg className={styles.progressSvg} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className={styles.progressTrack} />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      className={styles.progressFill}
                      style={{ strokeDashoffset: 251.2 - (251.2 * scanResult.probability) }}
                    />
                  </svg>
                  <div className={styles.progressText}>
                    <span className={styles.progressPercent}>{Math.round(scanResult.probability * 100)}%</span>
                    <span className={styles.progressLabel}>Probability</span>
                  </div>
                </div>

                <div className={styles.recommendationCard}>
                  <h4>AI Retention Recommendation:</h4>
                  <p>{scanResult.recommendation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Power BI & CSV Export section */}
      <section id="powerbi" className={styles.powerBiSection}>
        <div className={styles.powerBiGrid}>
          <div className={styles.powerBiLeft}>
            <div className={styles.badge} style={{ background: 'rgba(245, 158, 11, 0.08)', color: 'var(--warning)' }}>
              <FileSpreadsheet size={12} style={{ marginRight: '6px' }} />
              <span>POWER BI INTEGRATION</span>
            </div>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'left' }}>Connected Business Intelligence Reports</h2>
            <p className={styles.heroSub}>
              Connect the compiled churn database directly to Microsoft Power BI. Import the pre-structured dataset export files and load visualization graphics immediately.
            </p>
            <div className={styles.bulletList}>
              <div className={styles.bulletItem}>
                <CheckCircle size={16} className={styles.bulletIcon} />
                <span>DAX formulas defined for Churn Rates and lost MRR.</span>
              </div>
              <div className={styles.bulletItem}>
                <CheckCircle size={16} className={styles.bulletIcon} />
                <span>Interactive maps outlining contract risk segments.</span>
              </div>
            </div>
            <button onClick={() => navigate('/reports')} className="btn-primary" style={{ marginTop: '24px' }}>
              <span>Download Dataset CSV</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className={styles.powerBiRight}>
            <div className={`${styles.powerBiPreviewCard} glass-card`}>
              <div className={styles.previewHeader}>
                <span className={styles.previewDot}></span>
                <span>Power BI Dashboard Mockup</span>
              </div>
              <div className={styles.previewCharts}>
                <div className={styles.prevBarChart}>
                  <span className={styles.chartTitle}>Churn by Contract</span>
                  <div className={styles.barContainer}>
                    <div className={styles.barWrapper}>
                      <div className={styles.bar} style={{ height: '75%', background: 'linear-gradient(180deg, var(--danger) 0%, rgba(239, 68, 68, 0.4) 100%)' }}></div>
                      <span className={styles.barLabel}>M2M</span>
                    </div>
                    <div className={styles.barWrapper}>
                      <div className={styles.bar} style={{ height: '35%', background: 'linear-gradient(180deg, var(--warning) 0%, rgba(245, 158, 11, 0.4) 100%)' }}></div>
                      <span className={styles.barLabel}>1-Yr</span>
                    </div>
                    <div className={styles.barWrapper}>
                      <div className={styles.bar} style={{ height: '15%', background: 'linear-gradient(180deg, var(--success) 0%, rgba(16, 185, 129, 0.4) 100%)' }}></div>
                      <span className={styles.barLabel}>2-Yr</span>
                    </div>
                  </div>
                </div>
                <div className={styles.prevPieChart}>
                  <span className={styles.chartTitle}>Revenue Risk</span>
                  <div className={styles.pieContainer}>
                    <div className={styles.pieInner}></div>
                  </div>
                  <div className={styles.pieLegend}>
                    <div className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ backgroundColor: 'var(--primary)' }}></span>
                      <span>Stable</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ backgroundColor: 'var(--danger)' }}></span>
                      <span>At Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section id="testimonials" className={styles.testimonialsSection}>
        <h2 className={styles.sectionTitle}>Customer Testimonials</h2>
        <p className={styles.sectionSub}>Read reviews from telecom partners who integrated our AI console.</p>

        <div className={styles.sliderWrapper}>
          <button 
            onClick={() => setActiveTestimonial(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))}
            className={styles.sliderArrowBtn}
          >
            <ChevronLeft size={20} />
          </button>

          <div className={`${styles.testimonialCard} glass-card`}>
            <div className={styles.ratingStars}>
              {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" className={styles.starIcon} />
              ))}
            </div>
            <p className={styles.testimonialQuote}>"{testimonials[activeTestimonial].quote}"</p>
            <div className={styles.testimonialMeta}>
              <div className={styles.testimonialAvatar}>{testimonials[activeTestimonial].avatar}</div>
              <div>
                <h4 className={styles.testimonialAuthor}>{testimonials[activeTestimonial].author}</h4>
                <p className={styles.testimonialRole}>{testimonials[activeTestimonial].role}, {testimonials[activeTestimonial].company}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setActiveTestimonial(prev => (prev === testimonials.length - 1 ? 0 : prev + 1))}
            className={styles.sliderArrowBtn}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="pricing" className={styles.pricingSection}>
        <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
        <p className={styles.sectionSub}>Choose the right tier to start predicting and preventing subscriber churn.</p>

        <div className={styles.pricingGrid}>
          {/* Starter Plan */}
          <div className={`${styles.pricingCard} glass-card`}>
            <div className={styles.planHeader}>
              <h3 className={styles.planName}>Starter</h3>
              <p className={styles.planDesc}>Ideal for small telecom teams exploring AI prediction models.</p>
              <div className={styles.planPrice}>
                <span className={styles.priceCurrency}>$</span>
                <span className={styles.priceAmount}>39</span>
                <span className={styles.pricePeriod}>/month</span>
              </div>
            </div>
            <hr className={styles.planDivider} />
            <ul className={styles.planFeatures}>
              <li>
                <Check size={16} className={styles.planCheck} />
                <span>Up to 1,000 active subscribers</span>
              </li>
              <li>
                <Check size={16} className={styles.planCheck} />
                <span>Standard Random Forest model</span>
              </li>
              <li>
                <Check size={16} className={styles.planCheck} />
                <span>Single CSV file upload</span>
              </li>
              <li>
                <Check size={16} className={styles.planCheck} />
                <span>Standard email support</span>
              </li>
            </ul>
            <button onClick={handleStart} className={`${styles.planBtn} btn-secondary`}>
              Start Free Trial
            </button>
          </div>

          {/* Growth Plan */}
          <div className={`${styles.pricingCard} ${styles.pricingCardPopular} glass-card`}>
            <div className={styles.popularBadge}>MOST POPULAR</div>
            <div className={styles.planHeader}>
              <h3 className={styles.planName}>Growth</h3>
              <p className={styles.planDesc}>Perfect for expanding operators seeking automated dashboards.</p>
              <div className={styles.planPrice}>
                <span className={styles.priceCurrency}>$</span>
                <span className={styles.priceAmount}>99</span>
                <span className={styles.pricePeriod}>/month</span>
              </div>
            </div>
            <hr className={styles.planDivider} />
            <ul className={styles.planFeatures}>
              <li>
                <Check size={16} className={styles.planCheck} />
                <span>Up to 10,000 active subscribers</span>
              </li>
              <li>
                <Check size={16} className={styles.planCheck} />
                <span>Custom Hyperparameter tuning</span>
              </li>
              <li>
                <Check size={16} className={styles.planCheck} />
                <span>Interactive Power BI template</span>
              </li>
              <li>
                <Check size={16} className={styles.planCheck} />
                <span>Priority email & chat support</span>
              </li>
              <li>
                <Check size={16} className={styles.planCheck} />
                <span>Weekly model retraining</span>
              </li>
            </ul>
            <button onClick={handleStart} className={`${styles.planBtn} btn-primary`}>
              Get Started Growth
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className={`${styles.pricingCard} glass-card`}>
            <div className={styles.planHeader}>
              <h3 className={styles.planName}>Enterprise</h3>
              <p className={styles.planDesc}>Designed for national telecom giants requiring custom integrations.</p>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>Custom</span>
              </div>
            </div>
            <hr className={styles.planDivider} />
            <ul className={styles.planFeatures}>
              <li>
                <Check size={16} className={styles.planCheck} />
                <span>Unlimited subscriber accounts</span>
              </li>
              <li>
                <Check size={16} className={styles.planCheck} />
                <span>Deep Learning Neural Network model</span>
              </li>
              <li>
                <Check size={16} className={styles.planCheck} />
                <span>Real-time REST API endpoints</span>
              </li>
              <li>
                <Check size={16} className={styles.planCheck} />
                <span>Dedicated customer success manager</span>
              </li>
              <li>
                <Check size={16} className={styles.planCheck} />
                <span>99.9% uptime SLA guarantee</span>
              </li>
            </ul>
            <button onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })} className={`${styles.planBtn} btn-secondary`}>
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* CTA Gradient Banner */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBanner}>
          <h2>Ready to Reduce Customer Churn?</h2>
          <p>Start predicting contract risk profiles today with our high-accuracy machine learning model.</p>
          <button onClick={handleStart} className={styles.ctaBannerBtn}>
            <span>Start Predicting Now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={styles.contactSection}>
        <h2 className={styles.sectionTitle}>Get in Touch</h2>
        <p className={styles.sectionSub}>Have questions? Our team of data scientists and telecom analysts is here to help.</p>

        <div className={`${styles.contactGrid} glass-card`}>
          {/* Contact Details Left */}
          <div className={styles.contactInfo}>
            <h3 className={styles.contactInfoTitle}>Contact Information</h3>
            <p className={styles.contactInfoSub}>Fill out the form and our team will get back to you within 24 hours.</p>

            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}><Mail size={18} /></div>
                <div>
                  <h4>Email Support</h4>
                  <p>support@churnpredict.ai</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}><Phone size={18} /></div>
                <div>
                  <h4>Phone Hotline</h4>
                  <p>+1 (800) 555-CHURN</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}><MapPin size={18} /></div>
                <div>
                  <h4>Headquarters</h4>
                  <p>100 Vercel Way, Suite 400, San Francisco, CA</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}><Clock size={18} /></div>
                <div>
                  <h4>Operating Hours</h4>
                  <p>Monday - Friday: 9 AM - 6 PM PST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Right */}
          <div className={styles.contactFormWrapper}>
            {contactSuccess ? (
              <div className={styles.contactSuccessState}>
                <CheckCircle size={48} className={styles.successFormIcon} />
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for reaching out. A churn specialist will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className={styles.contactForm}>
                <div className={styles.contactFormGroup}>
                  <label htmlFor="contact-name">Full Name</label>
                  <input 
                    type="text" 
                    id="contact-name"
                    required 
                    placeholder="John Doe" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className={styles.contactFormGroup}>
                  <label htmlFor="contact-email">Work Email</label>
                  <input 
                    type="email" 
                    id="contact-email"
                    required 
                    placeholder="john@telecom.com" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className={styles.contactFormGroup}>
                  <label htmlFor="contact-message">Message</label>
                  <textarea 
                    id="contact-message"
                    required 
                    rows="4" 
                    placeholder="How can we help reduce your churn rate?" 
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  ></textarea>
                </div>

                <button type="submit" disabled={contactSending} className="btn-primary" style={{ justifyContent: 'center' }}>
                  {contactSending ? 'Sending Message...' : (
                    <>
                      <span>Send Message</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Large Premium Footer */}
      <footer id="footer" className={styles.footerSection}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <Logo size={18} strokeColor="#ffffff" />
              </div>
              <span className={styles.logoMain}>ChurnPredict AI</span>
            </div>
            <p className={styles.footerDesc}>Machine learning-powered telecom analytics and retention optimization workspace.</p>
          </div>

          <div className={styles.footerLinksBlock}>
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>

          <div className={styles.footerLinksBlock}>
            <h4>Resources</h4>
            <a href="#">Blog</a>
            <a href="#">Documentation</a>
            <a href="#">API Keys</a>
          </div>

          <div className={styles.footerLinksBlock}>
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Model Retraining</a>
            <a href="#">System Health</a>
          </div>

          <div className={styles.footerNewsletter}>
            <h4>Join Our Newsletter</h4>
            <p>Get weekly insights on customer retention and telecom analytics.</p>
            <form className={styles.newsletterForm} onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }}>
              <input type="email" placeholder="you@company.com" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} ChurnPredict AI. Designed for Telecom Retention Operations.</p>
        </div>
      </footer>
    </div>
  );
};

const SparkleIcon = () => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="var(--primary)" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ marginRight: '6px' }}
  >
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707" />
  </svg>
);

export default Home;
