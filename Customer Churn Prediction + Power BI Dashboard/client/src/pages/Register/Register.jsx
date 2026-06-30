import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import Logo from '../../components/Logo/Logo';
import styles from '../Login/Login.module.css'; // Re-use styling

const Register = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.glow}></div>
      <div className={`${styles.card} glass-card`}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <Logo size={22} />
          </div>
          <span className={styles.logoText}>ChurnPredict AI</span>
        </div>

        <h2 className={styles.title}>Get Started</h2>
        <p className={styles.subtitle}>Create a new analyst profile to manage predictions</p>

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrapper}>
              <User size={16} className={styles.inputIcon} />
              <input
                type="text"
                required
                className={styles.input}
                placeholder="John Doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                required
                className={styles.input}
                placeholder="operator@aurora.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type="password"
                required
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            {loading ? 'Creating account...' : 'Create Profile'}
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account? <Link to="/login" className={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
