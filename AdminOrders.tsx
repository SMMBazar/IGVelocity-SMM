import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit2 } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const res = await fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefund = async (id: number) => {
    if (!window.confirm('Are you sure you want to refund this order? The amount will be returned to the user balance.')) return;
    
    try {
      const res = await fetch(`/api/admin/orders/${id}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to refund order');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-zinc-400">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Manage Orders</h2>
        <p className="text-zinc-400">Process and update status of all user orders.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Service</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Profit</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-300">#{order.id}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{order.username}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{order.service_name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{order.quantity}</td>
                  <td className="px-6 py-4 text-sm text-emerald-500 font-bold">
                    ₹{(order.total_price - (order.cost_price_per_1000 / 1000 * order.quantity)).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                      order.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                      order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                      order.status === 'Refunded' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-instagram-purple/10 text-instagram-purple'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Refunded" disabled>Refunded</option>
                      </select>
                      {order.status !== 'Refunded' && order.status !== 'Cancelled' && (
                        <button 
                          onClick={() => handleRefund(order.id)}
                          className="px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
