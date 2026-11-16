import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, ShoppingBag, MapPin, DollarSign, Search } from 'lucide-react';
import { CustomerStats } from '../types';
import { api } from '../services/api';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Customer Directory</h2>
          <p className="text-xs text-slate-500 font-medium">Customer contact information, lifetime order count and total spend</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 font-black text-base flex items-center justify-center">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm text-slate-900 truncate">{c.name}</h3>
                <p className="text-xs text-slate-400 truncate">{c.email}</p>
                <a href={`tel:${c.phone}`} className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" />
                  {c.phone}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orders Placed</span>
                <span className="font-black text-slate-900 text-base">{c.total_orders}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lifetime Spend</span>
                <span className="font-black text-emerald-600 text-base">₹{c.total_spent}</span>
              </div>
            </div>

            {c.addresses && c.addresses.length > 0 && (
              <div className="text-[11px] text-slate-500 pt-1">
                <span className="font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Primary Delivery Address:
                </span>
                <p className="truncate">{c.addresses[0].address_line}, {c.addresses[0].city}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
