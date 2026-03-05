import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Wallet, 
  LogOut, 
  Users, 
  Settings, 
  CreditCard, 
  ShoppingBag,
  MessageCircle,
  Ticket
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [telegramId, setTelegramId] = React.useState('admin_igvelocity');

  React.useEffect(() => {
    fetch('/api/settings/payment')
      .then(res => res.json())
      .then(data => {
        if (data.telegram_id) setTelegramId(data.telegram_id);
      });
  }, []);

  const userLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', external: false },
    { name: 'New Order', icon: PlusCircle, path: '/new-order', external: false },
    { name: 'My Orders', icon: History, path: '/orders', external: false },
    { name: 'Add Funds', icon: Wallet, path: '/add-funds', external: false },
    { name: 'Support', icon: MessageCircle, path: '/support', external: false },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin', external: false },
    { name: 'Manage Users', icon: Users, path: '/admin/users', external: false },
    { name: 'Manage Services', icon: Settings, path: '/admin/services', external: false },
    { name: 'Manage Orders', icon: ShoppingBag, path: '/admin/orders', external: false },
    { name: 'Manage Payments', icon: CreditCard, path: '/admin/payments', external: false },
    { name: 'Manage Coupons', icon: Ticket, path: '/admin/coupons', external: false },
    { name: 'Support Settings', icon: MessageCircle, path: '/admin/support', external: false },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <div className="w-64 h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col fixed left-0 top-0">
      <div className="p-6 instagram-gradient mb-2 relative overflow-hidden">
        <h1 className="text-2xl font-bold text-white relative z-10">IGVelocity</h1>
        <div className="text-[9px] text-white/90 font-bold tracking-wider uppercase mt-1 relative z-10">
          Created With ♥️ HSxInnovations Works
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          if (link.external) {
            return (
              <a
                key={link.name}
                href={link.path}
                target="_blank"
                rel="noreferrer"
                className="sidebar-link"
              >
                <Icon size={20} />
                <span>{link.name}</span>
              </a>
            );
          }

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="mb-4 px-4">
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
            {user?.role === 'admin' ? 'Total Earnings' : 'Wallet Balance'}
          </p>
          <p className="text-lg font-bold text-white">
            ₹{(user?.role === 'admin' ? user?.totalEarnings : user?.balance)?.toFixed(2)}
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full sidebar-link text-red-500 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
