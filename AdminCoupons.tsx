import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Ticket, Percent, IndianRupee } from 'lucide-react';
import { motion } from 'motion/react';

interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order: number;
  usage_limit: number;
  used_count: number;
  is_active: number;
  created_at: string;
}

const AdminCoupons: React.FC = () => {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    min_order: 0,
    usage_limit: 0
  });

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCoupons(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCoupon)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewCoupon({ code: '', type: 'percentage', value: 0, min_order: 0, usage_limit: 0 });
        fetchCoupons();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create coupon');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCoupons();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete coupon');
      }
    } catch (e) {
      console.error(e);
      alert('Something went wrong');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Coupons</h1>
          <p className="text-zinc-400">Create and manage discount codes for users</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-instagram-purple hover:bg-instagram-pink text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
        >
          <Plus size={20} />
          Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <motion.div
            key={coupon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl relative group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-instagram-purple/20 p-3 rounded-xl">
                <Ticket className="text-instagram-purple" size={24} />
              </div>
              <button
                onClick={() => handleDelete(coupon.id)}
                className="text-zinc-500 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">{coupon.code}</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium px-2 py-1 rounded-md bg-zinc-800 text-zinc-300">
                {coupon.type === 'percentage' ? 'Percentage Discount' : 'Fixed Discount'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Discount Value</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  {coupon.type === 'percentage' ? (
                    <><Percent size={14} /> {coupon.value}%</>
                  ) : (
                    <><IndianRupee size={14} /> {coupon.value}</>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Min. Order Value</span>
                <span className="text-white font-semibold">₹{coupon.min_order}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Usage Limit</span>
                <span className="text-white font-semibold">
                  {coupon.usage_limit === 0 ? 'Unlimited' : `${coupon.used_count} / ${coupon.usage_limit}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Status</span>
                <span className={`font-semibold ${coupon.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Create New Coupon</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME50"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-instagram-purple uppercase"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Discount Type</label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-instagram-purple"
                  value={newCoupon.type}
                  onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as any })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Discount Value</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-instagram-purple"
                  value={newCoupon.value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Min. Order Value (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-instagram-purple"
                  value={newCoupon.min_order}
                  onChange={(e) => setNewCoupon({ ...newCoupon, min_order: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Usage Limit (0 for Unlimited)</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-instagram-purple"
                  value={newCoupon.usage_limit}
                  onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-instagram-purple hover:bg-instagram-pink text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
