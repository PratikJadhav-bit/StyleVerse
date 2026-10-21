import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Package, ShoppingBag, Star, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import styles from './Analytics.module.css';

const GOLD = '#C9A227';
const BLACK = '#111';
const PIE_COLORS = [BLACK, GOLD, '#555', '#888', '#bbb', '#ddd'];

function KPICard({ icon, label, value, sub, color }) {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiIcon} style={{ color }}>{icon}</div>
      <div className={styles.kpiValue}>{value}</div>
      <div className={styles.kpiLabel}>{label}</div>
      {sub && <div className={styles.kpiSub}>{sub}</div>}
    </div>
  );
}

export default function Analytics() {
  const [sales, setSales] = useState([]);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, t, c, inv, k] = await Promise.all([
        analyticsService.getSales(),
        analyticsService.getTrends(),
        analyticsService.getCategories(),
        analyticsService.getInventory(),
        analyticsService.getKPIs(),
      ]);
      setSales(s.data);
      setTrends(t.data.slice(0, 8));
      setCategories(c.data);
      setInventory(inv.data);
      setKpis(k.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) return <div className="loading-center" style={{ minHeight: '80vh' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className={styles.header}>
        <div className="container">
          <div className={styles.headerRow}>
            <div>
              <p className="section-eyebrow">Business Intelligence</p>
              <h1 className="section-title">Analytics <em>Dashboard</em></h1>
            </div>
            <button className="btn btn-outline btn-sm" onClick={fetchAll}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        {/* KPI Cards */}
        {kpis && (
          <div className={styles.kpiGrid}>
            <KPICard icon={<ShoppingBag size={22} />} label="Total Orders" value={kpis.total_orders.toLocaleString()} color={GOLD} />
            <KPICard icon={<TrendingUp size={22} />} label="Total Revenue" value={`₹${(kpis.total_revenue / 100000).toFixed(1)}L`} sub="All time" color="#27ae60" />
            <KPICard icon={<Package size={22} />} label="Total Products" value={kpis.total_products} color={BLACK} />
            <KPICard icon={<Star size={22} />} label="Avg Rating" value={`${kpis.avg_rating} ★`} color="#f39c12" />
          </div>
        )}

        {/* Sales Forecast Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Sales Forecast — AI Prediction</h3>
            <div className={styles.legend}>
              <span><span className={styles.dot} style={{ background: BLACK }} />Actual</span>
              <span><span className={styles.dot} style={{ background: GOLD }} />AI Forecast</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={sales} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Inter' }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v, n) => [`₹${v.toLocaleString()}`, n === 'actual' ? 'Actual' : 'AI Forecast']} />
              <Line type="monotone" dataKey="actual" stroke={BLACK} strokeWidth={2.5} dot={{ r: 4, fill: BLACK }} />
              <Line type="monotone" dataKey="forecast" stroke={GOLD} strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 4, fill: GOLD }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartsRow}>
          {/* Trend Analytics */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Fashion Trend Analytics</h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trends} layout="vertical" margin={{ left: 80, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `+${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={v => [`+${v}%`, 'Growth']} />
                <Bar dataKey="growth" radius={[0, 4, 4, 0]}>
                  {trends.map((_, i) => <Cell key={i} fill={i === 0 ? BLACK : i === 1 ? GOLD : `hsl(0,0%,${35 + i * 8}%)`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Performance */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Category Split</h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categories} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={3}>
                  {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + ' products', n]} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Summary */}
        {inventory && (
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Smart Inventory Status</h3>
            </div>
            <div className={styles.invGrid}>
              <div className={styles.invStat}>
                <span className={styles.invNum}>{inventory.total_skus}</span>
                <span className={styles.invLabel}>Total SKUs</span>
              </div>
              <div className={styles.invStat}>
                <span className={styles.invNum} style={{ color: '#c9a227' }}>{inventory.new_arrivals}</span>
                <span className={styles.invLabel}>New Arrivals</span>
              </div>
              <div className={styles.invStat}>
                <span className={styles.invNum} style={{ color: '#e74c3c' }}>{inventory.low_stock}</span>
                <span className={styles.invLabel}>Low Stock</span>
              </div>
              <div className={styles.invStat}>
                <span className={styles.invNum} style={{ color: '#c0392b' }}>{inventory.out_of_stock}</span>
                <span className={styles.invLabel}>Out of Stock</span>
              </div>
            </div>
            <div className={styles.invAlerts}>
              <div className={`${styles.invAlert} ${styles.warning}`}>
                <AlertTriangle size={14} /> Low stock alert — 3 products have less than 5 units remaining
              </div>
              <div className={`${styles.invAlert} ${styles.success}`}>
                <CheckCircle size={14} /> Inventory sync complete — all warehouses up to date
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
