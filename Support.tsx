import React, { useState, useEffect } from 'react';
import { MessageCircle, Instagram, ExternalLink } from 'lucide-react';

const Support: React.FC = () => {
  const [supportData, setSupportData] = useState({ telegram_id: '', instagram_username: '' });

  useEffect(() => {
    const fetchSupport = async () => {
      try {
        const res = await fetch('/api/settings/payment');
        if (res.ok) {
          const data = await res.json();
          setSupportData({
            telegram_id: data.telegram_id,
            instagram_username: data.instagram_username
          });
        }
      } catch (e) {
        console.error('Failed to fetch support info', e);
      }
    };
    fetchSupport();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Customer Support</h2>
        <p className="text-zinc-400 text-lg">Need help? Contact us through any of these platforms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Telegram Card */}
        <a 
          href={`https://t.me/${supportData.telegram_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card p-10 flex flex-col items-center text-center hover:scale-105 transition-transform group"
        >
          <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-sky-500/20 transition-colors">
            <MessageCircle size={40} className="text-sky-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Telegram</h3>
          <p className="text-zinc-400 mb-6">Fastest response for order issues and balance updates.</p>
          <div className="flex items-center gap-2 text-sky-400 font-medium">
            Chat on Telegram <ExternalLink size={16} />
          </div>
        </a>

        {/* Instagram Card */}
        <a 
          href={`https://instagram.com/${supportData.instagram_username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card p-10 flex flex-col items-center text-center hover:scale-105 transition-transform group"
        >
          <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-pink-500/20 transition-colors">
            <Instagram size={40} className="text-pink-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Instagram</h3>
          <p className="text-zinc-400 mb-6">Follow us for updates and DM for general inquiries.</p>
          <div className="flex items-center gap-2 text-pink-500 font-medium">
            Follow on Instagram <ExternalLink size={16} />
          </div>
        </a>
      </div>

      <div className="mt-12 glass-card p-8 text-center">
        <h4 className="text-white font-bold mb-2">Working Hours</h4>
        <p className="text-zinc-400">Monday - Sunday: 10:00 AM - 10:00 PM (IST)</p>
      </div>
    </div>
  );
};

export default Support;
