import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BrainCircuit, 
  BarChart3, 
  FileText, 
  UserCircle, 
  LogOut,
  TrendingUp
} from 'lucide-react';
import Logo from '../Logo/Logo';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/customers', label: 'Customers', icon: <Users size={20} /> },
    { path: '/prediction', label: 'AI Predict', icon: <BrainCircuit size={20} /> },
    { path: '/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { path: '/reports', label: 'Reports', icon: <FileText size={20} /> },
    { path: '/powerbi', label: 'Power BI', icon: <TrendingUp size={20} /> },
    { path: '/profile', label: 'Profile', icon: <UserCircle size={20} /> },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection} onClick={() => navigate('/')}>
        <div className={styles.logoIcon}>
          <Logo size={22} />
        </div>
        <div className={styles.logoText}>
          <span>ChurnPredict</span>
          <span className={styles.logoSub}>AI Telecom</span>
        </div>
      </div>

      <nav className={styles.navMenu}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeLink : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className={styles.profileSection}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className={styles.profileDetails}>
              <div className={styles.userName}>{user.username}</div>
              <div className={styles.userRole}>{user.role || 'operator'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
