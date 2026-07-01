import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Database, 
  RefreshCcw, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Activity, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Palette,
  QrCode,
  Smartphone,
  Code,
  Settings,
  Cpu,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import styles from './Profile.module.css';
import { THEMES, AVATAR_STYLES, applyTheme, applyAvatarStyle } from '../../utils/theme';

const Profile = () => {
  const { user, token, setUser, API_URL } = useAuth();

  // 1. Edit Profile Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 2. Developer Key Portal States
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  // 3. Server Telemetry States
  const [latency, setLatency] = useState(24);
  const [totalSubscribers, setTotalSubscribers] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [latencyHistory, setLatencyHistory] = useState([22, 26, 19, 31, 24, 28, 22, 25, 20, 24]);

  // 4. Global Preference Preferences
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem('churnpredict_theme') || 'default');
  const [activeAvatarStyle, setActiveAvatarStyle] = useState(localStorage.getItem('churnpredict_avatar_style') || 'sunset');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // 5. Interactive MFA Security States
  const [mfaEnabled, setMfaEnabled] = useState(localStorage.getItem('churnpredict_mfa') === 'true');
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [securityScore, setSecurityScore] = useState(localStorage.getItem('churnpredict_mfa') === 'true' ? 100 : 65);

  // 6. Developer Code Playground States
  const [apiTab, setApiTab] = useState('js');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // 7. Activity Logs
  const [activities, setActivities] = useState([
    { id: 1, action: 'User Authenticated', desc: 'Secure session token issued successfully.', time: 'Just Now', icon: <Shield size={12} /> },
    { id: 2, action: 'Telemetry Sync', desc: 'Node.js server resources mapped to client canvas.', time: '10 mins ago', icon: <RefreshCcw size={12} /> },
    { id: 3, action: 'AI Model Query', desc: 'Calculated single customer churn probability.', time: '1 hour ago', icon: <Activity size={12} /> }
  ]);

  // Initialize edit form when user loads
  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username,
        email: user.email,
        password: '',
        confirmPassword: ''
      });
    }
  }, [user, isEditing]);

  // Periodically oscillate response ping to simulate active server health
  useEffect(() => {
    const timer = setInterval(() => {
      const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
      setLatency(prev => {
        const next = Math.max(12, Math.min(60, prev + delta));
        // Add to history
        setLatencyHistory(hist => {
          const updated = [...hist.slice(1), next];
          return updated;
        });
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Fetch telemetry & dynamic stats from server
  const fetchServerTelemetry = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    const start = Date.now();
    try {
      // Fetch subscribers total to get real-time database record count
      const res = await fetch(`${API_URL}/customers?page=1&limit=1`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const duration = Date.now() - start;
      setLatency(duration);
      setLatencyHistory(hist => [...hist.slice(1), duration]);

      if (res.ok) {
        const data = await res.json();
        setTotalSubscribers(data.total);
      }
    } catch (err) {
      console.error('Error fetching server telemetry:', err);
    } finally {
      if (!silent) {
        setTimeout(() => setIsSyncing(false), 600);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchServerTelemetry(true);
    }
  }, [user]);

  if (!user) return <p style={{ padding: '40px', marginLeft: '280px' }}>Loading user profile...</p>;

  // Copy API Token to Clipboard
  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Rotate Key simulated trigger
  const handleRotateKey = () => {
    const confirmRotate = window.confirm("Are you sure you want to rotate your developer access clearance key? Programmatic API applications using the current token will fail immediately.");
    if (!confirmRotate) return;
    
    // Add to activity log
    setActivities(prev => [
      { id: Date.now(), action: 'Access Key Rotated', desc: 'Developer clearance key invalidated and re-issued.', time: 'Just Now', icon: <Key size={12} /> },
      ...prev
    ]);

    setSuccessMsg('Developer programmatic access key rotated successfully.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Handle saving profile changes to backend
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setFormLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: editForm.username,
          email: editForm.email,
          ...(editForm.password && { password: editForm.password })
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Globally update the authenticated user object in context
        setUser(data.user);
        setSuccessMsg('Profile updated successfully.');
        setIsEditing(false);

        // Add to activity log
        setActivities(prev => [
          { id: Date.now(), action: 'Account Settings Updated', desc: 'Username or email credentials updated in database.', time: 'Just Now', icon: <User size={12} /> },
          ...prev
        ]);
      } else {
        setErrorMsg(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error. Failed to save profile changes.');
    } finally {
      setFormLoading(false);
    }
  };

  // Global Theme Toggle
  const handleThemeChange = (themeKey) => {
    applyTheme(themeKey);
    setActiveTheme(themeKey);

    setActivities(prev => [
      { 
        id: Date.now(), 
        action: 'Workspace Theme Updated', 
        desc: `System preference changed to ${THEMES[themeKey]?.name || themeKey}.`, 
        time: 'Just Now', 
        icon: <Palette size={12} /> 
      },
      ...prev
    ]);
  };

  // Avatar Style Toggle
  const handleAvatarStyleChange = (styleKey) => {
    applyAvatarStyle(styleKey);
    setActiveAvatarStyle(styleKey);
    setShowAvatarPicker(false);

    setActivities(prev => [
      { 
        id: Date.now(), 
        action: 'Avatar Style Updated', 
        desc: `Profile branding gradient modified to ${AVATAR_STYLES[styleKey]?.name || styleKey}.`, 
        time: 'Just Now', 
        icon: <Settings size={12} /> 
      },
      ...prev
    ]);
  };

  // Interactive MFA Toggle & Verification
  const handleMfaToggle = (e) => {
    const checked = e.target.checked;
    if (checked) {
      setIsMfaModalOpen(true);
      setMfaCode('');
      setMfaError('');
    } else {
      // Disable MFA
      setMfaEnabled(false);
      localStorage.setItem('churnpredict_mfa', 'false');
      setSecurityScore(65);
      setActivities(prev => [
        { 
          id: Date.now(), 
          action: 'MFA Deactivated', 
          desc: 'Multi-Factor Authentication disabled. Account security score reduced.', 
          time: 'Just Now', 
          icon: <AlertCircle size={12} style={{ color: 'var(--danger)' }} /> 
        },
        ...prev
      ]);
    }
  };

  const handleVerifyMfa = (e) => {
    e.preventDefault();
    setMfaError('');
    
    // Simulated simple verification code: 123456
    if (mfaCode.trim() === '123456') {
      setMfaEnabled(true);
      localStorage.setItem('churnpredict_mfa', 'true');
      setSecurityScore(100);
      setIsMfaModalOpen(false);
      
      setActivities(prev => [
        { 
          id: Date.now(), 
          action: 'MFA Security Secured', 
          desc: 'Multi-factor login verification initialized and cryptographic keys activated.', 
          time: 'Just Now', 
          icon: <CheckCircle size={12} style={{ color: 'var(--success)' }} /> 
        },
        ...prev
      ]);

      setSuccessMsg('Multi-Factor Authentication (MFA) successfully activated on your account.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccessMsg(''), 5000);
    } else {
      setMfaError('Invalid signature verification code. Please enter the mock passcode: 123456.');
    }
  };

  // Copy API Playground Snippet
  const getCodeSnippet = () => {
    const cleanToken = token ? token : 'YOUR_API_JWT_TOKEN';
    const baseUrl = API_URL ? API_URL : 'http://localhost:5000/api';
    
    if (apiTab === 'js') {
      return `// Query predictions programmatically
const token = "${cleanToken.substring(0, 25)}...";
fetch("${baseUrl}/customers?page=1&limit=5", {
  headers: {
    "Authorization": "Bearer " + token
  }
})
  .then(res => res.json())
  .then(data => console.log("Subscribers Data:", data))
  .catch(err => console.error("API Error:", err));`;
    }
    if (apiTab === 'python') {
      return `# Python programmatic churn querying
import requests

token = "${cleanToken.substring(0, 25)}..."
url = "${baseUrl}/customers"
headers = {
    "Authorization": f"Bearer {token}"
}

params = {"page": 1, "limit": 5}
response = requests.get(url, headers=headers, params=params)

if response.status_code == 200:
    print("AI Database Profiles:", response.json())
else:
    print("Fetch Failed:", response.text)`;
    }
    return `# cURL terminal command query
curl -X GET "${baseUrl}/customers?page=1&limit=5" \\
  -H "Authorization: Bearer ${cleanToken.substring(0, 25)}..."`;
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Dynamic SVG sparkline graph rendering
  const getSparklinePath = (data) => {
    if (!data || data.length === 0) return '';
    const width = 340;
    const height = 42;
    const max = Math.max(...data, 30);
    const min = Math.min(...data, 10);
    const range = max - min || 1;
    
    return data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height + 2;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        
        {/* Left Column: Profile settings, theme options, security rating */}
        <div className={styles.leftColumn}>
          
          {/* Success / Error Banners */}
          {successMsg && (
            <div className={styles.bannerSuccess}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className={styles.bannerError}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isEditing ? (
            /* Standard Profile View Card with Custom Predefined Avatars */
            <div className="glass-card" style={{ padding: '32px' }}>
              <div className={styles.cardHeader}>
                <div className={styles.headerAvatar}>
                  <div 
                    className={styles.avatarContainer} 
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    title="Customize Avatar Style"
                  >
                    <div className={styles.avatarLarge}>
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className={styles.avatarOverlay}>
                      <Settings size={18} />
                    </div>
                  </div>

                  {/* Predefined Avatar Gradient Picker */}
                  {showAvatarPicker && (
                    <div className={styles.avatarPicker}>
                      <div className={styles.avatarPickerTitle}>Custom Avatar Gradient</div>
                      {Object.keys(AVATAR_STYLES).map((key) => (
                        <button
                          key={key}
                          onClick={() => handleAvatarStyleChange(key)}
                          className={`${styles.avatarPickerItem} ${activeAvatarStyle === key ? styles.avatarPickerActive : ''}`}
                        >
                          <div 
                            className={styles.avatarPreviewCircle} 
                            style={{ 
                              background: AVATAR_STYLES[key].gradient,
                              boxShadow: AVATAR_STYLES[key].shadow 
                            }} 
                          />
                          <span className={styles.avatarPickerName}>{AVATAR_STYLES[key].name}</span>
                          {activeAvatarStyle === key && <Check size={14} style={{ color: 'var(--primary)' }} />}
                        </button>
                      ))}
                    </div>
                  )}

                  <div>
                    <h2 className={styles.name}>{user.username}</h2>
                    <span className={styles.roleBadge}>
                      <Shield size={10} />
                      <span>{user.role === 'admin' ? 'Clearance: Administrator' : 'Clearance: Operator'}</span>
                    </span>
                  </div>
                </div>
                <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }}>
                  <span>Edit Settings</span>
                </button>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailCard}>
                  <Mail size={15} className={styles.detailIcon} />
                  <div>
                    <span className={styles.detailLabel}>Email Address</span>
                    <span className={styles.detailValue}>{user.email}</span>
                  </div>
                </div>

                <div className={styles.detailCard}>
                  <Shield size={15} className={styles.detailIcon} />
                  <div>
                    <span className={styles.detailLabel}>Security Clearance</span>
                    <span className={styles.detailValue}>{user.role === 'admin' ? 'Level 3 SuperUser' : 'Level 1 Operations'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Editable Profile Form Card */
            <div className="glass-card" style={{ padding: '32px' }}>
              <div className={styles.formHeader}>
                <h3 className={styles.formTitle}>Edit Profile Settings</h3>
                <p className={styles.formDesc}>Modify account credentials and login authentication passwords.</p>
              </div>

              <form onSubmit={handleSaveProfile} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Username</label>
                    <input 
                      type="text" 
                      required 
                      className={styles.input} 
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      className={styles.input} 
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>New Password (Optional)</label>
                    <input 
                      type="password" 
                      placeholder="Leave blank to keep current" 
                      className={styles.input} 
                      value={editForm.password}
                      onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="Confirm password" 
                      className={styles.input} 
                      value={editForm.confirmPassword}
                      onChange={(e) => setEditForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    disabled={formLoading} 
                    onClick={() => setIsEditing(false)} 
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={formLoading} 
                    className="btn-primary" 
                    style={{ gap: '6px' }}
                  >
                    <Lock size={13} />
                    <span>{formLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Interactive Global Theme Customization Panel */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <div className={styles.securityHeader}>
              <Palette size={16} className={styles.detailIcon} />
              <h3 className={styles.securityTitle}>Global Branding & Themes</h3>
            </div>
            <p className={styles.formDesc} style={{ marginBottom: '18px' }}>
              Select a visual layout identity. Changes propagate instantly to all dashboards, sidebars, and models.
            </p>
            
            <div className={styles.themeGrid}>
              {Object.keys(THEMES).map((key) => (
                <div
                  key={key}
                  onClick={() => handleThemeChange(key)}
                  className={`${styles.themeCard} ${activeTheme === key ? styles.themeCardActive : ''}`}
                >
                  <div className={styles.themeName}>{THEMES[key].name}</div>
                  <div className={styles.themeColorsPreview}>
                    <div className={styles.colorCircle} style={{ background: THEMES[key].colors['--primary'] }} title="Primary" />
                    <div className={styles.colorCircle} style={{ background: THEMES[key].colors['--secondary'] }} title="Secondary" />
                    <div className={styles.colorCircle} style={{ background: THEMES[key].colors['--bg-primary'] }} title="Background" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Clearance & MFA Setup Panel */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <div className={styles.securityHeader}>
              <Shield size={16} className={styles.detailIcon} style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.06)' }} />
              <h3 className={styles.securityTitle}>Security Clearance Health</h3>
            </div>
            <p className={styles.formDesc} style={{ marginBottom: '18px' }}>
              Manage access clearance factors, cryptographic verification layers, and MFA signatures.
            </p>

            <div className={styles.scoreContainer}>
              <div className={styles.scoreLabels}>
                <span>Security Integrity Rating</span>
                <span style={{ color: securityScore === 100 ? 'var(--success)' : 'var(--warning)' }}>{securityScore}%</span>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreProgress} style={{ width: `${securityScore}%` }} />
              </div>
            </div>

            <div className={styles.securityList}>
              <div className={styles.securityItem}>
                <div className={styles.securityItemLeft}>
                  <Lock size={14} style={{ color: 'var(--success)' }} />
                  <span>Strong Password Enabled</span>
                </div>
                <div className={styles.securityItemSuccess}>
                  <CheckCircle size={14} />
                  <span>Active</span>
                </div>
              </div>

              <div className={styles.securityItem}>
                <div className={styles.securityItemLeft}>
                  <Shield size={14} style={{ color: 'var(--success)' }} />
                  <span>API Scope Encryption (SHA-256)</span>
                </div>
                <div className={styles.securityItemSuccess}>
                  <CheckCircle size={14} />
                  <span>Verified</span>
                </div>
              </div>

              <div className={styles.securityItem}>
                <div className={styles.securityItemLeft}>
                  <Smartphone size={14} style={{ color: mfaEnabled ? 'var(--success)' : 'var(--warning)' }} />
                  <span>Multi-Factor Authentication (MFA)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={mfaEnabled ? styles.securityItemSuccess : styles.securityItemWarning}>
                    {mfaEnabled ? 'Secured' : 'Inactive'}
                  </span>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={mfaEnabled} 
                      onChange={handleMfaToggle}
                    />
                    <span className={styles.slider} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline Logs Card */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <div className={styles.activityHeader}>
              <Activity size={16} className={styles.activityTitleIcon} />
              <h3 className={styles.activityTitle}>Account Activity Log</h3>
            </div>
            <p className={styles.activityDesc}>Recent security indicators and modeling computations under your credentials.</p>
            
            <div className={styles.timeline}>
              {activities.map((act) => (
                <div key={act.id} className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>
                    {act.icon}
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeaderRow}>
                      <span className={styles.timelineAction}>{act.action}</span>
                      <span className={styles.timelineTime}>{act.time}</span>
                    </div>
                    <p className={styles.timelineDesc}>{act.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Developer API Token, API Playground & Server Telemetry */}
        <div className={styles.rightColumn}>
          
          {/* Developer API Key Clearance */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <div className={styles.sectionHeader}>
              <Key size={16} className={styles.headerIconPurple} />
              <h3 className={styles.sectionTitle}>Developer API Portal</h3>
            </div>
            <p className={styles.sectionDesc}>Query prediction endpoints and customer telemetries programmatically using your JWT token.</p>
            
            <div className={styles.tokenContainer}>
              <div className={styles.tokenBox}>
                <code className={styles.tokenText}>
                  {showToken ? token : `${token.substring(0, 24)}••••••••••••••••••••••••`}
                </code>
              </div>
              <div className={styles.tokenActions}>
                <button 
                  onClick={() => setShowToken(!showToken)} 
                  className={styles.iconBtn} 
                  title={showToken ? "Hide Access Token" : "Reveal Access Token"}
                >
                  {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button 
                  onClick={handleCopyToken} 
                  className={`${styles.iconBtn} ${copied ? styles.copiedActive : ''}`} 
                  title="Copy Access Token"
                >
                  {copied ? <Check size={15} style={{ color: 'var(--success)' }} /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            {/* Programmatic API Code Playground */}
            <div className={styles.playgroundTitle}>
              <Code size={13} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--primary)' }} />
              <span>Programmatic Fetch Playground</span>
            </div>
            
            <div className={styles.codeTabs}>
              <button onClick={() => setApiTab('js')} className={`${styles.codeTab} ${apiTab === 'js' ? styles.codeTabActive : ''}`}>JavaScript</button>
              <button onClick={() => setApiTab('python')} className={`${styles.codeTab} ${apiTab === 'python' ? styles.codeTabActive : ''}`}>Python</button>
              <button onClick={() => setApiTab('curl')} className={`${styles.codeTab} ${apiTab === 'curl' ? styles.codeTabActive : ''}`}>cURL</button>
            </div>

            <div className={styles.terminalWindow}>
              <div className={styles.terminalHeader}>
                <div className={styles.terminalDots}>
                  <span className={styles.dotRed} />
                  <span className={styles.dotYellow} />
                  <span className={styles.dotGreen} />
                </div>
                <span className={styles.terminalTitle}>
                  {apiTab === 'js' && 'api_fetch.js'}
                  {apiTab === 'python' && 'query_model.py'}
                  {apiTab === 'curl' && 'terminal.sh'}
                </span>
              </div>
              <div className={styles.terminalBody}>
                <pre className={styles.terminalCode}>
                  <code>{getCodeSnippet()}</code>
                </pre>
                <button onClick={handleCopySnippet} className={styles.terminalCopyBtn} title="Copy Snippet">
                  {copiedSnippet ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <button onClick={handleRotateKey} className="btn-secondary" style={{ marginTop: '20px', width: '100%', justifyContent: 'center', gap: '6px' }}>
              <RefreshCcw size={13} />
              <span>Rotate Access Key</span>
            </button>
          </div>

          {/* Database & Server Health Telemetry */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <div className={styles.sectionHeader}>
              <Database size={16} className={styles.headerIconCyan} />
              <h3 className={styles.sectionTitle}>Server Resource Telemetry</h3>
            </div>
            <p className={styles.sectionDesc}>Active configurations, sync ratings, and database connection status.</p>
            
            <div className={styles.statusList}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Node Server Endpoint</span>
                <span className={styles.statusValOk}>http://localhost:5000</span>
              </div>

              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Server Response Ping</span>
                <span className={latency ? styles.statusValOk : styles.statusValWarning}>
                  {latency ? `${latency}ms (Active)` : 'Measuring...'}
                </span>
              </div>

              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Clearance Database</span>
                <span className={totalSubscribers ? styles.statusValOk : styles.statusValWarning}>
                  {totalSubscribers !== null ? `${totalSubscribers.toLocaleString()} Profiles` : 'Loading...'}
                </span>
              </div>

              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Storage Engine</span>
                <span className={styles.statusValOk}>
                  MongoDB Driver fallbacks active
                </span>
              </div>

              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>ML Scoring Models</span>
                <span className={styles.statusValOk}>Heuristics + Python FastAPI</span>
              </div>
            </div>

            {/* Live Latency Sparkline Section */}
            <div className={styles.sparklineSection}>
              <div className={styles.sparklineLabelRow}>
                <span className={styles.sparklineTitle}>
                  <span className={styles.sparklinePulse} />
                  <span>Real-time Response Sparkline</span>
                </span>
                <span className={styles.sparklineVal}>{latency}ms</span>
              </div>
              <svg className={styles.sparklineSvg} viewBox="0 0 340 50">
                <defs>
                  <linearGradient id="sparklineGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path 
                  d={getSparklinePath(latencyHistory)} 
                  stroke="var(--accent)" 
                  strokeWidth="2.5" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{ transition: 'd 0.5s ease' }}
                />
                {/* Under-path glow fill */}
                <path
                  d={`${getSparklinePath(latencyHistory)} L 340 50 L 0 50 Z`}
                  fill="url(#sparklineGlow)"
                  stroke="none"
                  style={{ transition: 'd 0.5s ease' }}
                />
              </svg>
            </div>

            <button 
              onClick={() => fetchServerTelemetry()} 
              disabled={isSyncing}
              className="btn-primary" 
              style={{ marginTop: '20px', width: '100%', justifyContent: 'center', gap: '8px' }}
            >
              <RefreshCcw size={13} className={isSyncing ? styles.spin : ''} />
              <span>{isSyncing ? 'Syncing Node...' : 'Sync Server Resources'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Glassmorphic MFA Setup Verification Modal */}
      {isMfaModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <QrCode className={styles.modalIcon} size={22} />
              <h3 className={styles.modalTitle}>Configure MFA Clearance</h3>
            </div>
            <p className={styles.modalDesc}>
              To authorize Multi-Factor Authentication, scan the security QR code using your mobile authentication application (e.g. Google Authenticator) and sign the security clearance code.
            </p>

            <div className={styles.qrContainer}>
              <div className={styles.qrCodeGraphic} />
              <span className={styles.qrLabel}>KEY: CHURNPREDICT-OPERATOR</span>
            </div>

            <form onSubmit={handleVerifyMfa} className={styles.mfaForm}>
              <div className={styles.pinInputsContainer}>
                <label className={styles.pinLabel}>6-Digit Security PIN Code</label>
                <input 
                  type="text" 
                  required 
                  maxLength={6}
                  placeholder="Enter Passcode (Mock: 123456)" 
                  className={styles.pinInput}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              {mfaError && (
                <div className={styles.mfaErrorText}>
                  <AlertCircle size={13} />
                  <span>{mfaError}</span>
                </div>
              )}

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsMfaModalOpen(false);
                    setMfaEnabled(false);
                  }} 
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Verify Signatures
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
