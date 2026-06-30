import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader/Loader';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line,
  CartesianGrid
} from 'recharts';
import { BarChart3, HelpCircle, AlertTriangle } from 'lucide-react';
import styles from './Analytics.module.css';

const Analytics = () => {
  const { token, API_URL } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/analytics`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const analyticsData = await res.json();
          setData(analyticsData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <Loader />;
  if (!data) return <div className={styles.error}>Failed to fetch analytics metrics.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        
        {/* Gender Breakdown */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 className={styles.chartTitle}>Gender Demographics Churn</h3>
          <p className={styles.chartDesc}>Subscribers segmented by gender identity.</p>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.genderChart}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'Plus Jakarta Sans', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} />
                <Bar dataKey="active" name="Active" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churned" name="Churned" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 className={styles.chartTitle}>Churn by Billing Channels</h3>
          <p className={styles.chartDesc}>Impact of manual checks vs auto-billing.</p>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.paymentMethodChart}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'Plus Jakarta Sans', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} />
                <Bar dataKey="value" name="Subscribers" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churned" name="Churned" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tenure Lifecycles */}
        <div className="glass-card" style={{ padding: '28px', gridColumn: 'span 2' }}>
          <h3 className={styles.chartTitle}>Subscriber Lifecycles (Tenure Cohorts)</h3>
          <p className={styles.chartDesc}>Churn density during early customer lifecycle stages.</p>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.tenureChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'Plus Jakarta Sans', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} />
                <Line type="monotone" dataKey="value" name="Total in Cohort" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="churned" name="Churned in Cohort" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cohort Heatmap */}
        <div className="glass-card" style={{ padding: '28px', gridColumn: 'span 2' }}>
          <h3 className={styles.chartTitle}>Customer Cohort Retention Heatmap</h3>
          <p className={styles.chartDesc}>Percentage of active subscribers tracked by signup cohort month over a 24-month lifecycle.</p>
          <div className={styles.heatmapContainer}>
            <table className={styles.heatmapTable}>
              <thead>
                <tr>
                  <th className={styles.heatmapHeaderCell} style={{ textAlign: 'left' }}>Cohort Month</th>
                  <th className={styles.heatmapHeaderCell}>Size</th>
                  <th className={styles.heatmapHeaderCell}>Month 1</th>
                  <th className={styles.heatmapHeaderCell}>Month 3</th>
                  <th className={styles.heatmapHeaderCell}>Month 6</th>
                  <th className={styles.heatmapHeaderCell}>Month 12</th>
                  <th className={styles.heatmapHeaderCell}>Month 18</th>
                  <th className={styles.heatmapHeaderCell}>Month 24</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cohort: 'Jan 2025', size: '1,420', m1: '100%', m3: '94.2%', m6: '88.5%', m12: '81.2%', m18: '75.4%', m24: '71.0%' },
                  { cohort: 'Feb 2025', size: '1,380', m1: '100%', m3: '93.5%', m6: '87.1%', m12: '79.8%', m18: '74.2%', m24: '69.5%' },
                  { cohort: 'Mar 2025', size: '1,510', m1: '100%', m3: '95.0%', m6: '89.2%', m12: '82.5%', m18: '76.8%', m24: '72.1%' },
                  { cohort: 'Apr 2025', size: '1,290', m1: '100%', m3: '92.8%', m6: '86.4%', m12: '78.1%', m18: '73.0%', m24: '68.2%' },
                  { cohort: 'May 2025', size: '1,460', m1: '100%', m3: '94.0%', m6: '88.0%', m12: '80.5%', m18: '75.0%', m24: '' },
                  { cohort: 'Jun 2025', size: '1,600', m1: '100%', m3: '95.6%', m6: '90.1%', m12: '83.9%', m18: '', m24: '' }
                ].map((row, idx) => (
                  <tr key={idx} className={styles.heatmapRow}>
                    <td className={styles.heatmapLabelCell}>{row.cohort}</td>
                    <td className={styles.heatmapSizeCell}>{row.size}</td>
                    {['m1', 'm3', 'm6', 'm12', 'm18', 'm24'].map((monthKey) => {
                      const val = row[monthKey];
                      if (val === '') {
                        return <td key={monthKey} className={styles.heatmapEmptyCell} />;
                      }
                      
                      // Calculate Heatmap density background colors
                      const num = parseFloat(val);
                      let bg = 'transparent';
                      if (num === 100) bg = 'rgba(37, 99, 235, 0.9)'; // Primary Blue (Deepest)
                      else if (num >= 90) bg = 'rgba(37, 99, 235, 0.7)';
                      else if (num >= 85) bg = 'rgba(37, 99, 235, 0.5)';
                      else if (num >= 80) bg = 'rgba(37, 99, 235, 0.4)';
                      else if (num >= 75) bg = 'rgba(37, 99, 235, 0.3)';
                      else if (num >= 70) bg = 'rgba(37, 99, 235, 0.2)';
                      else bg = 'rgba(239, 68, 68, 0.15)'; // Low retention red alert

                      return (
                        <td 
                          key={monthKey} 
                          className={styles.heatmapValueCell}
                          style={{ 
                            background: bg,
                            color: num < 75 ? 'var(--danger)' : '#FFFFFF'
                          }}
                          title={`Cohort: ${row.cohort} | Month: ${monthKey.toUpperCase()} | Retention: ${val}`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
