import React, { useEffect, useState } from 'react';

const Marquee: React.FC = () => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await fetch('/api/settings/payment');
        if (res.ok) {
          const data = await res.json();
          setAnnouncement(data.announcement || '');
        }
      } catch (e) {
        console.error('Failed to fetch announcement:', e);
      }
    };
    fetchAnnouncement();
  }, []);

  if (!announcement) return null;

  return (
    <div className="bg-instagram-purple/20 border-b border-instagram-purple/30 py-2 overflow-hidden whitespace-nowrap relative">
      <div className="inline-block animate-marquee text-sm font-medium text-white px-4">
        {announcement}
      </div>
      <div className="inline-block animate-marquee text-sm font-medium text-white px-4">
        {announcement}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Marquee;
