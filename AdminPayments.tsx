import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, X, ExternalLink, QrCode, Save } from 'lucide-react';

const AdminPayments: React.FC = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upiId, setUpiId] = useState('');
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  const fetchPayments = async () => {
    const res = await fetch('/api/admin/payments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setPayments(data);
    }
    setLoading(false);
  };

  const fetchSettings = async () => {
    const res = await fetch('/api/settings/payment');
    if (res.ok) {
      const data = await res.json();
      setUpiId(data.upi_id || '');
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchSettings();
  }, [token]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/payments/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPayments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSuccess('');

    const formData = new FormData();
    formData.append('upi_id', upiId);
    if (qrFile) {
      formData.append('qr_code', qrFile);
    }

    try {
      const res = await fetch('/api/admin/settings/payment', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setSettingsSuccess('Payment settings updated successfully!');
        setQrFile(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSettingsLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-zinc-400">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Manage Payments</h2>
        <p className="text-zinc-400">Review and approve user deposit requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h3 className="text-xl font-bold text-white">Payment Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Proof</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-zinc-300">#{payment.id}</td>
                    <td className="px-6 py-4 text-sm text-white font-medium">{payment.username}</td>
                    <td className="px-6 py-4 text-sm text-emerald-500 font-bold">₹{payment.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {payment.screenshot_url ? (
                        <a 
                          href={payment.screenshot_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-instagram-purple hover:underline flex items-center gap-1 text-sm"
                        >
                          View <ExternalLink size={14} />
                        </a>
                      ) : 'No proof'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        payment.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                        payment.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAction(payment.id, 'approve')}
                            className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => handleAction(payment.id, 'reject')}
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                      No payment requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <QrCode className="text-instagram-purple" />
            Admin Settings
          </h3>
          
          {settingsSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 p-3 rounded-lg mb-6 text-sm">
              {settingsSuccess}
            </div>
          )}

          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Admin UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-instagram-purple"
                placeholder="e.g. yourname@upi"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Upload New QR Code (PNG or JPG)</label>
              <div className="relative border-2 border-dashed border-zinc-700 rounded-xl p-4 text-center hover:border-instagram-purple transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <p className="text-xs text-zinc-500">
                  {qrFile ? qrFile.name : 'Click to upload PNG or JPG'}
                </p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={settingsLoading}
              className="w-full instagram-btn flex items-center justify-center gap-2 py-3 disabled:opacity-50"
            >
              <Save size={18} />
              {settingsLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
