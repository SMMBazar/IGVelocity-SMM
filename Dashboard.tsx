import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Wallet, Clock, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecentOrders(data.slice(0, 5));
      }
    };
    fetchOrders();
  }, [token]);

  const stats = [
    { name: 'Wallet Balance', value: `₹${user?.balance?.toFixed(2)}`, icon: Wallet, color: 'text-emerald-500' },
    { name: 'Total Orders', value: recentOrders.length, icon: ShoppingBag, color: 'text-instagram-purple' },
    { name: 'Pending Orders', value: recentOrders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'text-amber-500' },
    { name: 'Completed Orders', value: recentOrders.filter(o => o.status === 'Completed').length, icon: CheckCircle, color: 'text-instagram-pink' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-1">Welcome back, {user?.username}!</h2>
        <p className="text-zinc-400">Here's what's happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
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

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Recent Orders</h3>
          <button className="text-instagram-pink text-sm font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Service</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-300">#{order.id}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{order.service_name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{order.quantity}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300">₹{order.total_price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                      order.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                      order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                      'bg-instagram-purple/10 text-instagram-purple'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No orders found. Start by placing a new order!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
