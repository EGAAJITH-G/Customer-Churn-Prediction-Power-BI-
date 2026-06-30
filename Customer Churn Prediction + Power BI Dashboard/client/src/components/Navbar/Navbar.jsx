import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Bell, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = () => {
  const location = useLocation();
  const calendarRef = useRef(null);
  const notificationsRef = useRef(null);

  // Dropdown & Date States
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'danger',
      title: 'High-Risk Churn Alert',
      message: 'Customer #4892 risk score exceeded 88%. Action recommended.',
      time: '10m ago',
      unread: true
    },
    {
      id: 2,
      type: 'info',
      title: 'Model Re-Calibration',
      message: 'XGBoost model training completed. ROC-AUC score is 0.892.',
      time: '2h ago',
      unread: true
    },
    {
      id: 3,
      type: 'success',
      title: 'CSV Report Export',
      message: 'Campaign target list (240 subscribers) exported successfully.',
      time: '4h ago',
      unread: true
    },
    {
      id: 4,
      type: 'warning',
      title: 'Fallback DB Mode Active',
      message: 'Using local JSON storage fallback. MongoDB connection timeout.',
      time: '1d ago',
      unread: false
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Click Outside Listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Overview';
      case '/dashboard':
        return 'Telecom Churn Dashboard';
      case '/customers':
        return 'Customer Directory';
      case '/prediction':
        return 'AI Churn Risk Predictor';
      case '/analytics':
        return 'Deep Analytics';
      case '/reports':
        return 'Executive Reports';
      case '/profile':
        return 'Operator Profile';
      default:
        return 'ChurnPredict AI';
    }
  };

  const getFormattedDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Calendar Calculation Helper
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    const prevMonthDaysTotal = new Date(year, month, 0).getDate();
    
    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({ 
        day: prevMonthDaysTotal - i, 
        isCurrentMonth: false, 
        dateObj: new Date(year, month - 1, prevMonthDaysTotal - i) 
      });
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({ 
        day: i, 
        isCurrentMonth: true, 
        dateObj: new Date(year, month, i) 
      });
    }
    
    return days;
  };

  // Change Calendar Month
  const handlePrevMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
  };

  // Select Date
  const handleSelectDate = (dateObj) => {
    setSelectedDate(dateObj);
    setCurrentCalendarDate(dateObj);
    setShowCalendar(false);
  };

  // Notification Actions
  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleDeleteNotification = (id, e) => {
    e.stopPropagation(); // prevent triggering click-to-read
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  // Get Notification Icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className={styles.iconDanger} size={16} />;
      case 'success':
        return <CheckCircle className={styles.iconSuccess} size={16} />;
      case 'warning':
        return <AlertTriangle className={styles.iconWarning} size={16} />;
      default:
        return <Info className={styles.iconInfo} size={16} />;
    }
  };

  const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const calendarDays = getDaysInMonth(currentCalendarDate);

  return (
    <header className={styles.navbar}>
      <div className={styles.titleSection}>
        <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
        <p className={styles.subtitle}>Telecom Customer Insights Panel</p>
      </div>

      <div className={styles.actionSection}>
        {/* Interactive Date Badge */}
        <div className={styles.dateBadgeWrapper} ref={calendarRef}>
          <button 
            onClick={() => { setShowCalendar(!showCalendar); setShowNotifications(false); }} 
            className={styles.dateBadge}
          >
            <Calendar size={15} />
            <span>{getFormattedDate(selectedDate)}</span>
          </button>

          {showCalendar && (
            <div className={`${styles.calendarDropdown} glass-card`}>
              <div className={styles.calendarHeader}>
                <button onClick={handlePrevMonth} className={styles.calendarNavBtn}>
                  <ChevronLeft size={16} />
                </button>
                <span className={styles.calendarMonthYear}>
                  {monthsList[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}
                </span>
                <button onClick={handleNextMonth} className={styles.calendarNavBtn}>
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className={styles.weekdaysGrid}>
                {weekdays.map(day => (
                  <span key={day} className={styles.weekdayLabel}>{day}</span>
                ))}
              </div>

              <div className={styles.daysGrid}>
                {calendarDays.map((d, index) => {
                  const isSelected = selectedDate.getDate() === d.day && 
                                    selectedDate.getMonth() === d.dateObj.getMonth() && 
                                    selectedDate.getFullYear() === d.dateObj.getFullYear();
                  
                  const isToday = new Date().getDate() === d.day && 
                                  new Date().getMonth() === d.dateObj.getMonth() && 
                                  new Date().getFullYear() === d.dateObj.getFullYear();

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectDate(d.dateObj)}
                      className={`${styles.dayCell} ${!d.isCurrentMonth ? styles.dayCellOutside : ''} ${isSelected ? styles.dayCellSelected : ''} ${isToday && !isSelected ? styles.dayCellToday : ''}`}
                    >
                      {d.day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Bell Icon */}
        <div className={styles.bellWrapper} ref={notificationsRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowCalendar(false); }} 
            className={styles.iconContainer}
            title="System Alerts"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className={styles.badge} />}
          </button>

          {showNotifications && (
            <div className={`${styles.notificationsDropdown} glass-card`}>
              <div className={styles.notificationsHeader}>
                <div>
                  <h4 className={styles.notifTitle}>System Alerts</h4>
                  <span className={styles.notifSubtitle}>{unreadCount} unread notifications</span>
                </div>
                <div className={styles.notifActions}>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className={styles.textLink}>
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={handleClearAll} className={styles.textLinkDanger}>
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.notificationsList}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyText}>No alerts active</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => handleMarkAsRead(notif.id)}
                      className={`${styles.notifItem} ${notif.unread ? styles.notifUnread : ''}`}
                    >
                      <div className={styles.notifIconWrapper}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className={styles.notifContent}>
                        <div className={styles.notifRow}>
                          <span className={styles.notifHeading}>{notif.title}</span>
                          <span className={styles.notifTime}>
                            <Clock size={10} style={{ marginRight: '3px' }} />
                            {notif.time}
                          </span>
                        </div>
                        <p className={styles.notifBody}>{notif.message}</p>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteNotification(notif.id, e)} 
                        className={styles.deleteNotifBtn}
                        title="Dismiss"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.secBadge}>
          <ShieldAlert size={14} />
          <span>Heuristic Fallback Enabled</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

