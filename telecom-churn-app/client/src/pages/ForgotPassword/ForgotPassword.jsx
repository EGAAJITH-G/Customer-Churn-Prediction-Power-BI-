import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import Logo from '../../components/Logo/Logo';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1: Send Code, 2: Reset Password, 3: Success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess('Verification code sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (code.length !== 6) {
      return setError('Verification code must be exactly 6 digits');
    }

    setLoading(true);

    try {
      await resetPassword(email, code, newPassword);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your code.');
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

        {step === 1 && (
          <>
            <h2 className={styles.title}>Forgot Password</h2>
            <p className={styles.subtitle}>Enter your registered email address to receive a 6-digit verification code</p>

            {error && (
              <div className={styles.errorBox}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSendCode} className={styles.form}>
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

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className={styles.title}>Reset Password</h2>
            <p className={styles.subtitle}>Enter the 6-digit verification code sent to your email and your new password</p>

            {error && (
              <div className={styles.errorBox}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className={styles.successBox}>
                <CheckCircle2 size={16} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>6-Digit Verification Code</label>
                <div className={styles.inputWrapper}>
                  <KeyRound size={16} className={styles.inputIcon} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    className={styles.input}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>New Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={16} className={styles.inputIcon} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    className={styles.input}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Confirm New Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={16} className={styles.inputIcon} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    className={styles.input}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div className={styles.successWrapper}>
            <div className={styles.successIconBox}>
              <CheckCircle2 size={36} className={styles.successCheck} />
            </div>
            <h2 className={styles.title} style={{ textAlign: 'center' }}>Reset Successful!</h2>
            <p className={styles.subtitle} style={{ textAlign: 'center', marginBottom: '24px' }}>
              Your password has been successfully updated. You can now log in with your new password.
            </p>
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Back to Login
            </button>
          </div>
        )}

        {step !== 3 && (
          <div className={styles.backToLogin}>
            <Link to="/login" className={styles.backLink}>
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
