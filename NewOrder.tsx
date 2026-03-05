import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NewOrder: React.FC = () => {
  const { token, refreshProfile } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponValid, setCouponValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data);
      
      // Extract unique categories
      const uniqueCategories: string[] = Array.from(new Set(data.map((s: any) => s.category)));
      setCategories(uniqueCategories);
    };
    fetchServices();
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedService(null);
    setQuantity(0);
    setCouponCode('');
    setCouponDiscount(0);
    setCouponValid(false);
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const service = services.find(s => s.id === parseInt(e.target.value));
    setSelectedService(service);
    setQuantity(service?.min_quantity || 0);
    setCouponCode('');
    setCouponDiscount(0);
    setCouponValid(false);
  };

  const filteredServices = services.filter(s => s.category === selectedCategory);

  const calculatePrice = () => {
    if (!selectedService || !quantity) return 0;
    const original = (selectedService.price_per_1000 / 1000) * quantity;
    return Math.max(0, original - couponDiscount);
  };

  const validateCoupon = async () => {
    if (!couponCode) return;
    const amount = (selectedService.price_per_1000 / 1000) * quantity;
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: couponCode, amount })
      });
      const data = await res.json();
      if (res.ok) {
        setCouponDiscount(data.discount);
        setCouponValid(true);
        setError('');
      } else {
        setCouponDiscount(0);
        setCouponValid(false);
        setError(data.error);
      }
    } catch (e) {
      setError('Failed to validate coupon');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedService) return setError('Please select a service');
    if (!link) return setError('Please enter a link');
    if (quantity < selectedService.min_quantity) return setError(`Minimum quantity is ${selectedService.min_quantity}`);
    if (quantity > selectedService.max_quantity) return setError(`Maximum quantity is ${selectedService.max_quantity}`);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          service_id: selectedService.id,
          link,
          quantity,
          coupon_code: couponValid ? couponCode : null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Order placed successfully!');
        await refreshProfile();
        setTimeout(() => navigate('/orders'), 2000);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Place New Order</h2>
        <p className="text-zinc-400">Boost your Instagram presence in seconds.</p>
      </div>

      <div className="glass-card p-8">
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
            <label className="block text-sm font-medium text-zinc-400 mb-2">Select Category</label>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-instagram-purple appearance-none"
              required
            >
              <option value="">Choose a category...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Select Service</label>
            <select
              value={selectedService?.id || ''}
              onChange={handleServiceChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-instagram-purple appearance-none disabled:opacity-50"
              required
              disabled={!selectedCategory}
            >
              <option value="">{selectedCategory ? 'Choose a service...' : 'Select category first'}</option>
              {filteredServices.map(s => (
                <option key={s.id} value={s.id}>{s.name} - ₹{s.price_per_1000}/1k</option>
              ))}
            </select>
          </div>

          {selectedService && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold">Minimum</p>
                <p className="text-white font-bold">{selectedService.min_quantity}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold">Maximum</p>
                <p className="text-white font-bold">{selectedService.max_quantity}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Instagram Link</label>
            <input
              type="url"
              placeholder="https://www.instagram.com/p/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-instagram-purple"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-instagram-purple"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Coupon Code (Optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-instagram-purple uppercase"
              />
              <button
                type="button"
                onClick={validateCoupon}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Apply
              </button>
            </div>
            {couponValid && (
              <p className="text-emerald-500 text-xs mt-1">Coupon applied! You saved ₹{couponDiscount.toFixed(2)}</p>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <span className="text-zinc-400 font-medium">Total Price</span>
              <span className="text-2xl font-bold text-white">₹{calculatePrice().toFixed(2)}</span>
            </div>
            <button type="submit" className="w-full instagram-btn py-4 text-lg">
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrder;
