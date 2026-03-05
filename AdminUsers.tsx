import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminUsers: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [token]);

  if (loading) return <div className="p-8 text-zinc-400">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Manage Users</h2>
        <p className="text-zinc-400">View and manage all registered users.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Balance</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-300">#{user.id}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-emerald-500 font-bold">₹{user.balance.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-instagram-purple/10 text-instagram-purple' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(user.created_at).toLocaleDateString()}
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

export default AdminUsers;
