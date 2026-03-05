import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, ShoppingBag, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    };

    const fetchAnalytics = async () => {
      const res = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    };

    fetchStats();
    fetchAnalytics();
  }, [token]);

  if (!stats) return <div className="p-8 text-zinc-400">Loading...</div>;

  const statCards = [
    { name: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
    { name: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-instagram-purple' },
    { name: 'Total Earnings', value: `₹${stats.totalEarnings.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-500' },
    { name: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: 'text-amber-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-1">Admin Control Center</h2>
        <p className="text-zinc-400">Monitor and manage the entire IGVelocity platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-zinc-800 ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-zinc-400 text-sm font-medium">{stat.name}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-emerald-500" size={20} />
            <h3 className="text-lg font-bold text-white">Revenue Trend (Last 7 Days)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  fontSize={12}
                  tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag className="text-instagram-purple" size={20} />
            <h3 className="text-lg font-bold text-white">Order Volume (Last 7 Days)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  fontSize={12}
                  tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  cursor={{ fill: '#27272a' }}
                />
                <Bar dataKey="count" fill="#E1306C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/services" className="p-4 bg-zinc-800 rounded-xl text-left hover:bg-zinc-700 transition-colors block">
              <p className="text-white font-bold mb-1">Add Service</p>
              <p className="text-xs text-zinc-500">Create new Instagram service</p>
            </Link>
            <button className="p-4 bg-zinc-800 rounded-xl text-left hover:bg-zinc-700 transition-colors">
              <p className="text-white font-bold mb-1">Backup DB</p>
              <p className="text-xs text-zinc-500">Download database snapshot</p>
            </button>
          </div>
        </div>
        
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Server Status</span>
              <span className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Database</span>
              <span className="text-white text-sm font-bold">SQLite 3.x</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Last Backup</span>
              <span className="text-zinc-500 text-sm">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
