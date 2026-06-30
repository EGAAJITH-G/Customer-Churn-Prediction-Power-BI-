import React from 'react';
import Logo from '../Logo/Logo';
import styles from './Loader.module.css';

const Loader = ({ size = 'medium', fullPage = false, message = 'Analyzing subscriber metrics...' }) => {
  return (
    <div className={`${styles.loaderContainer} ${fullPage ? styles.fullPage : ''}`}>
      {fullPage && (
        <>
          <div className={styles.blob1}></div>
          <div className={styles.blob2}></div>
          <div className={styles.gridOverlay}></div>
        </>
      )}
      
      <div className={`${styles.spinnerWrapper} ${styles[size]}`}>
        {/* Outer glowing ring */}
        <div className={styles.outerRing}></div>
        
        {/* Inner reverse rotating ring */}
        <div className={styles.innerRing}></div>
        
        {/* Central Brand Icon */}
        <div className={styles.centerIcon}>
          <Logo size={size === 'large' ? 32 : size === 'medium' ? 22 : 14} />
        </div>
      </div>
      
      <div className={styles.textContainer}>
        <p className={styles.loadingText}>{message}</p>
        {fullPage && <p className={styles.subText}>Connecting to prediction engines...</p>}
      </div>
    </div>
  );
};

export default Loader;
