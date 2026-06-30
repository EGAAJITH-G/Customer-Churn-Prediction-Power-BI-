import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import styles from './NotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={`${styles.card} glass-card`}>
        <div className={styles.iconWrapper}>
          <ShieldAlert size={36} />
        </div>
        <h2 className={styles.title}>Resource Not Found</h2>
        <p className={styles.subtitle}>The requested panel or file path does not exist on this server.</p>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ gap: '8px' }}>
          <ArrowLeft size={16} />
          <span>Return to Safety</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
