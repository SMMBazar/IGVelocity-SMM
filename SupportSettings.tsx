import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageCircle, Instagram, Save } from 'lucide-react';

const SupportSettings: React.FC = () => {
  const { token } = useAuth();
  const [telegramId, setTelegramId] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/payment');
        if (res.ok) {
          const data = await res.json();
          setTelegramId(data.telegram_id || '');
          setInstagramUsername(data.instagram_username || '');
          setAnnouncement(data.announcement || '');
        }
      } catch (e) {
        console.error('Failed to fetch support settings', e);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Update support settings
      const supportRes = await fetch('/api/admin/settings/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          telegram_id: telegramId,
          instagram_username: instagramUsername
        })
      });

      // Update announcement
      const announcementRes = await fetch('/api/admin/settings/announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ announcement })
      });

      if (supportRes.ok && announcementRes.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update some settings' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Support Settings</h2>
        <p className="text-zinc-400">Manage your contact information for customer support.</p>
      </div>

      <div className="glass-card p-8">
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 text-sm ${
            message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-500' : 'bg-red-500/10 border border-red-500/50 text-red-500'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
              <MessageCircle size={16} className="text-sky-400" />
              Telegram Username (without @)
            </label>
            <input
              type="text"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-instagram-purple"
              placeholder="e.g. admin_igvelocity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
              <Instagram size={16} className="text-pink-500" />
              Instagram Username
            </label>
            <input
              type="text"
              value={instagramUsername}
              onChange={(e) => setInstagramUsername(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-instagram-purple"
              placeholder="e.g. igvelocity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Top Announcement Banner (Scrolling Text)
            </label>
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-instagram-purple h-24 resize-none"
              placeholder="e.g. 🚀 Igvelocity: New Cheapest SMM Provider in the Market!"
            />
            <p className="text-xs text-zinc-500 mt-1">This text will scroll at the top of the website for all users.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full instagram-btn py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Support Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportSettings;
