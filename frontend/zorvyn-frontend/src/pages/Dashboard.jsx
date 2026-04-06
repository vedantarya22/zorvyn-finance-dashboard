import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './DashBoard.css';

const PIE_COLORS = ['#1D9E75', '#378ADD', '#BA7517', '#D4537E', '#7F77DD', '#E24B4A'];

const StatCard = ({ label, value, colorClass }) => (
  <div className="stat-card">
    <p className="stat-card__label">{label}</p>
    <p className={`stat-card__value ${colorClass}`}>{value}</p>
  </div>
);

const Dashboard = () => {
  const { hasRole }                 = useAuth();
  const [summary, setSummary]       = useState(null);
  const [trends, setTrends]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [recent, setRecent]         = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [recentRes, summaryRes, trendsRes, catRes] = await Promise.all([
          api.get('/dashboard/recent?limit=5'),
          hasRole('analyst') ? api.get('/dashboard/summary')    : Promise.resolve(null),
          hasRole('analyst') ? api.get('/dashboard/trends')     : Promise.resolve(null),
          hasRole('analyst') ? api.get('/dashboard/categories') : Promise.resolve(null),
        ]);

        setRecent(recentRes.data.records);
        if (summaryRes) setSummary(summaryRes.data.summary);
        if (trendsRes)  setTrends(trendsRes.data.trends);
        if (catRes)     setCategories(catRes.data.categories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  const getBalanceClass = (val) =>
    val >= 0 ? 'stat-card__value--green' : 'stat-card__value--red';

  if (loading) {
    return (
      <>
        <Navbar />
        <p className="dashboard__loading">Loading...</p>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard__page">

        {/* Stat cards */}
        {summary && (
          <div className="dashboard__stat-row">
            <StatCard
              label="Total Income"
              value={fmt(summary.totalIncome)}
              colorClass="stat-card__value--green"
            />
            <StatCard
              label="Total Expenses"
              value={fmt(summary.totalExpenses)}
              colorClass="stat-card__value--red"
            />
            <StatCard
              label="Net Balance"
              value={fmt(summary.netBalance)}
              colorClass={getBalanceClass(summary.netBalance)}
            />
            <StatCard
              label="Total Records"
              value={summary.totalRecords}
              colorClass="stat-card__value--neutral"
            />
          </div>
        )}

        {/* Charts */}
        {hasRole('analyst') && (
          <div className="dashboard__charts-row">

            {/* Bar chart */}
            <div className="dashboard__chart-card">
              <p className="dashboard__chart-title">Monthly trends</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trends} barCategoryGap="30%">
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `₹${v / 1000}k`}
                  />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="income"   name="Income"   fill="#1D9E75" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#E24B4A" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="dashboard__chart-card">
              <p className="dashboard__chart-title">Category breakdown</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categories.slice(0, 6)}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categories.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}

        {/* Recent transactions */}
        <div className="dashboard__table-card">
          <p className="dashboard__chart-title">Recent transactions</p>
          <table className="dashboard__table">
            <thead>
              <tr>
                <th className="dashboard__th">Category / Notes</th>
                <th className="dashboard__th">Type</th>
                <th className="dashboard__th">Date</th>
                <th className="dashboard__th">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="dashboard__td dashboard__td--muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                    No records yet
                  </td>
                </tr>
              ) : (
                recent.map((r) => (
                  <tr key={r._id} className="dashboard__tr">
                    <td className="dashboard__td">
                      <span style={{ fontWeight: 500 }}>{r.category}</span>
                      {r.notes && (
                        <span className="dashboard__note"> — {r.notes}</span>
                      )}
                    </td>
                    <td className="dashboard__td">
                      <span className={`type-pill type-pill--${r.type}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="dashboard__td dashboard__td--date">
                      {new Date(r.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className={`dashboard__td dashboard__td--${r.type === 'income' ? 'green' : 'red'}`}>
                      {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
};

export default Dashboard;