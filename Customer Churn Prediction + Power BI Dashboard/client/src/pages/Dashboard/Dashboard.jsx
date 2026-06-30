import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  DollarSign,
  TrendingDown,
  Hourglass,
  Brain,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import Loader from '../../components/Loader/Loader';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { token, API_URL } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch general stats
        const resStats = await fetch(`${API_URL}/dashboard/stats`, { headers });
        const dataStats = await resStats.json();
        setStats(dataStats);

        // Fetch detailed analytics for charts
        const resAnalytics = await fetch(`${API_URL}/dashboard/analytics`, { headers });
        const dataAnalytics = await resAnalytics.json();
        setAnalytics(dataAnalytics);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !stats || !analytics) return <Loader />;

  // Chart Color Schemes
  const COLORS_PRIMARY = ['#2563EB', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
  const COLORS_CONTRACT = ['#EF4444', '#10B981', '#2563EB'];
  const COLORS_INTERNET = ['#2563EB', '#7C3AED', '#F59E0B'];

  const kpis = [
    { label: 'Total Subscribers', value: stats.totalCustomers.toLocaleString(), icon: <Users size={20} />, change: '+8.4%', trend: 'up', color: 'blue' },
    { label: 'Active Subscribers', value: stats.activeCustomers.toLocaleString(), icon: <UserCheck size={20} />, change: '+6.1%', trend: 'up', color: 'emerald' },
    { label: 'Churned Subscribers', value: stats.inactiveCustomers.toLocaleString(), icon: <UserX size={20} />, change: '+12%', trend: 'down', color: 'coral' },
    { label: 'Churn Rate (%)', value: `${stats.churnRate}%`, icon: <TrendingDown size={20} />, change: '-1.4%', trend: 'up', color: 'violet' },
    { label: 'Monthly Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: <DollarSign size={20} />, change: '+4.2%', trend: 'up', color: 'amber' },
    { label: 'Revenue Lost', value: `$${stats.revenueLost.toLocaleString()}`, icon: <TrendingUp size={20} />, change: '+18%', trend: 'down', color: 'cyan' }
  ];

  return (
    <div className={styles.container}>
      {/* KPIs Row */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`${styles.kpiCard} glass-card`}>
            <div className={styles.kpiHeader}>
              <div className={`${styles.kpiIcon} ${styles[kpi.color]}`}>
                {kpi.icon}
              </div>
              <span className={`${styles.trendBadge} ${kpi.trend === 'up' ? styles.trendUp : styles.trendDown}`}>
                {kpi.change}
              </span>
            </div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={styles.kpiLabel}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Area Chart: Monthly Charges Bucket Churn */}
        <div className={`${styles.chartCard} glass-card`} style={{ gridColumn: 'span 2' }}>
          <h3 className={styles.chartTitle}>Monthly Cost vs. Churned Profiles</h3>
          <p className={styles.chartSub}>Shows risk distributions correlated against high bills.</p>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={analytics.monthlyTrend}>
                <defs>
                  <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'Plus Jakarta Sans', fontSize: 12 }} />
                <Area type="monotone" dataKey="count" name="Total Profiles" stroke="#2563EB" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                <Area type="monotone" dataKey="churned" name="Churned Profiles" stroke="#EF4444" fillOpacity={1} fill="url(#colorChurn)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Contracts */}
        <div className={`${styles.chartCard} glass-card`}>
          <h3 className={styles.chartTitle}>Subscribers by Contract</h3>
          <p className={styles.chartSub}>Segmentation distribution.</p>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.contractChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.contractChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_CONTRACT[index % COLORS_CONTRACT.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'Plus Jakarta Sans', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.legend}>
              {analytics.contractChart.map((item, idx) => (
                <div key={idx} className={styles.legendItem}>
                  <span className={styles.legendColor} style={{ backgroundColor: COLORS_CONTRACT[idx] }} />
                  <span className={styles.legendLabel}>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart: Internet Service */}
        <div className={`${styles.chartCard} glass-card`}>
          <h3 className={styles.chartTitle}>Internet Service Churn</h3>
          <p className={styles.chartSub}>Correlation with technology profile.</p>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.internetServiceChart}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'Plus Jakarta Sans', fontSize: 11 }} />
                <Bar dataKey="value" name="Subscribers" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="churned" name="Churned" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top High Risk Churn Customers & Heuristics */}
      <div className={styles.bottomGrid}>
        <div className="glass-card" style={{ padding: '32px', gridColumn: 'span 2' }}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>High Churn Probability Alerts</h3>
              <p className={styles.sectionSubtitle}>Top subscribers flagged by AI with probability &gt; 70%.</p>
            </div>
            <button onClick={() => navigate('/prediction')} className="btn-secondary">
              <span>Run AI Predictor</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subscriber ID</th>
                  <th>Contract</th>
                  <th>Internet</th>
                  <th>Tenure</th>
                  <th>Charges</th>
                  <th>Probability</th>
                  <th>Action Plan</th>
                </tr>
              </thead>
              <tbody>
                {stats.topRiskCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={styles.emptyTable}>No critical risks detected. All accounts stable.</td>
                  </tr>
                ) : (
                  stats.topRiskCustomers.map((cust) => (
                    <tr key={cust._id || cust.customerId}>
                      <td className={styles.custIdCell}>{cust.customerId}</td>
                      <td>{cust.contract}</td>
                      <td>{cust.internetService}</td>
                      <td>{cust.tenure} months</td>
                      <td>${cust.monthlyCharges.toFixed(2)}</td>
                      <td>
                        <span className={styles.probBadge}>
                          {Math.round(cust.churnProbability * 100)}%
                        </span>
                      </td>
                      <td>
                        <button onClick={() => navigate('/prediction')} className={styles.actionBtn}>
                          Propose Retention
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
