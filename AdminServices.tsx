import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const AdminServices: React.FC = () => {
  const { token } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    price_per_1000: '',
    cost_price_per_1000: '',
    min_quantity: '',
    max_quantity: '',
    category: 'Followers'
  });

  const fetchServices = async () => {
    const res = await fetch('/api/services');
    if (res.ok) {
      const data = await res.json();
      setServices(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newService.price_per_1000);
    const costPrice = parseFloat(newService.cost_price_per_1000);
    const min = parseInt(newService.min_quantity);
    const max = parseInt(newService.max_quantity);

    if (isNaN(price) || isNaN(costPrice) || isNaN(min) || isNaN(max)) {
      alert('Please enter valid numbers');
      return;
    }

    try {
      const url = editingService ? `/api/admin/services/${editingService.id}` : '/api/admin/services';
      const method = editingService ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newService,
          price_per_1000: price,
          cost_price_per_1000: costPrice,
          min_quantity: min,
          max_quantity: max
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setEditingService(null);
        setNewService({ name: '', price_per_1000: '', cost_price_per_1000: '', min_quantity: '', max_quantity: '', category: 'Followers' });
        fetchServices();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save service');
      }
    } catch (e) {
      console.error(e);
      alert('Something went wrong');
    }
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setIsOtherCategory(false);
    setNewService({
      name: service.name || '',
      price_per_1000: (service.price_per_1000 ?? '').toString(),
      cost_price_per_1000: (service.cost_price_per_1000 ?? '').toString(),
      min_quantity: (service.min_quantity ?? '').toString(),
      max_quantity: (service.max_quantity ?? '').toString(),
      category: service.category || 'Followers'
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchServices();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete service');
      }
    } catch (e) {
      console.error(e);
      alert('Something went wrong');
    }
  };

  if (loading) return <div className="p-8 text-zinc-400">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Manage Services</h2>
          <p className="text-zinc-400">Add or remove Instagram services.</p>
        </div>
        <button 
          onClick={() => {
            setEditingService(null);
            setIsOtherCategory(false);
            setNewService({ name: '', price_per_1000: '', cost_price_per_1000: '', min_quantity: '', max_quantity: '', category: 'Followers' });
            setShowAddModal(true);
          }}
          className="instagram-btn flex items-center gap-2"
        >
          <Plus size={20} /> Add Service
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Cost/1k</th>
                <th className="px-6 py-4 font-medium">Price/1k</th>
                <th className="px-6 py-4 font-medium">Min/Max</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-300">#{service.id}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{service.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">₹{Number(service.cost_price_per_1000 || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-emerald-500 font-bold">₹{Number(service.price_per_1000 || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{service.min_quantity} - {service.max_quantity}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{service.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(service)}
                        className="p-2 text-instagram-purple hover:bg-instagram-purple/10 rounded-lg transition-all"
                        title="Edit Service"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete Service"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-md w-full p-8 relative">
            <button 
              onClick={() => {
                setShowAddModal(false);
                setEditingService(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <Plus size={24} className="rotate-45" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Service Name</label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-instagram-purple"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Cost Price/1k (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newService.cost_price_per_1000}
                    onChange={(e) => setNewService({...newService, cost_price_per_1000: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-instagram-purple"
                    placeholder="CP"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Selling Price/1k (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newService.price_per_1000}
                    onChange={(e) => setNewService({...newService, price_per_1000: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-instagram-purple"
                    placeholder="SP"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Min Quantity</label>
                  <input
                    type="number"
                    value={newService.min_quantity}
                    onChange={(e) => setNewService({...newService, min_quantity: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-instagram-purple"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Max Quantity</label>
                  <input
                    type="number"
                    value={newService.max_quantity}
                    onChange={(e) => setNewService({...newService, max_quantity: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-instagram-purple"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
                <select
                  value={isOtherCategory ? 'Other' : newService.category}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setIsOtherCategory(true);
                      setNewService({...newService, category: ''});
                    } else {
                      setIsOtherCategory(false);
                      setNewService({...newService, category: e.target.value});
                    }
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-instagram-purple"
                  required
                >
                  <option value="">Select Category</option>
                  {Array.from(new Set([
                    'Followers', 'Likes', 'Views', 'Comments', 'Reels', 'Story', 'Package',
                    ...services.map(s => s.category)
                  ])).filter(Boolean).sort().map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Other">Other (Type below)</option>
                </select>
                {isOtherCategory && (
                  <input
                    type="text"
                    value={newService.category}
                    onChange={(e) => setNewService({...newService, category: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-instagram-purple mt-2"
                    placeholder="Enter custom category name"
                    required
                  />
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 instagram-btn">
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
