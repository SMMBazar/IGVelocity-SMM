import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { QrCode, Upload } from 'lucide-react';

const AddFunds: React.FC = () => {
  const { token } = useAuth();
  const [amount, setAmount] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({ upi_id: '', qr_url: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/payment');
        if (res.ok) {
          const data = await res.json();
          setPaymentSettings(data);
        }
      } catch (e) {
        console.error('Failed to fetch payment settings', e);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }
    if (!screenshot) {
      setError('Please upload a payment screenshot');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('screenshot', screenshot);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Payment request submitted! Admin will verify it soon.');
        setAmount('');
        setScreenshot(null);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Add Funds</h2>
        <p className="text-zinc-400">Add money to your wallet to place orders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <QrCode className="text-instagram-purple" />
            Scan to Pay
          </h3>
          <div className="bg-white p-4 rounded-2xl mb-6 flex justify-center">
            {paymentSettings.qr_url ? (
              <img 
                src={paymentSettings.qr_url} 
                alt="UPI QR Code" 
                className="w-64 h-64 object-contain"
              />
            ) : (
              <div className="w-64 h-64 bg-zinc-100 flex items-center justify-center text-zinc-400">
                Loading QR...
              </div>
            )}
          </div>
          <div className="space-y-4 text-zinc-400 text-sm">
            <p className="flex justify-between">
              <span>UPI ID:</span>
              <span className="text-white font-mono">{paymentSettings.upi_id || 'Loading...'}</span>
            </p>
            <p className="flex justify-between">
              <span>Wallet Name:</span>
              <span className="text-white">Himanshu Kumar</span>
            </p>
            <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 text-xs">
              <p className="font-bold text-white mb-1 uppercase">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Scan the QR code using any UPI app.</li>
                <li>Enter the amount you want to add.</li>
                <li>Complete the payment and take a screenshot.</li>
                <li>Upload the screenshot and enter amount here.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-6">Submit Payment Proof</h3>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 p-3 rounded-lg mb-6 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Amount Paid (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-instagram-purple"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Payment Screenshot</label>
              <div className="relative border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:border-instagram-purple transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <Upload className="mx-auto text-zinc-500 group-hover:text-instagram-purple mb-2" size={32} />
                <p className="text-sm text-zinc-400">
                  {screenshot ? screenshot.name : 'Click or drag screenshot here'}
                </p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full instagram-btn py-4 text-lg disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFunds;
