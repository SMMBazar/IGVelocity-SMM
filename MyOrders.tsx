import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const MyOrders: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [token]);

  if (loading) return <div className="p-8 text-zinc-400">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">My Orders</h2>
        <p className="text-zinc-400">Track all your Instagram service orders.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Service</th>
                <th className="px-6 py-4 font-medium">Link</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-300">#{order.id}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{order.service_name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400 truncate max-w-xs">
                    <a href={order.link} target="_blank" rel="noreferrer" className="hover:text-instagram-purple">
                      {order.link}
                    </a>
                  </td>
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
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                    No orders found.
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

export default MyOrders;
