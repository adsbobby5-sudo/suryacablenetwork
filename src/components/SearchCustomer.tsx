import React from 'react';
import { motion } from 'motion/react';
import { Search as SearchIcon, User, Phone, Box, ChevronRight, X } from 'lucide-react';
import { Customer, Invoice } from '../types';

interface SearchCustomerProps {
  customers: Customer[];
  invoices: Invoice[];
  onViewCustomer: (id: string) => void;
}

export default function SearchCustomer({ customers, invoices, onViewCustomer }: SearchCustomerProps) {
  const [query, setQuery] = React.useState('');
  
  const filteredCustomers = customers.filter(c => {
    const q = query.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.boxNumber || '').toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q) ||
      (c.id || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="sticky top-[60px] md:top-[72px] z-30 -mx-4 px-4 py-3 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 md:bg-transparent md:border-0 md:p-0 md:mx-0">
        <div className="relative group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search by Name, Phone, City, Box #, or ID..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer, idx) => {
            // Find the most recent invoice for this customer
            const customerInvoices = invoices
              .filter(i => i.customerId === customer.id)
              .sort((a, b) => b.month.localeCompare(a.month));
              
            const latestInvoice = customerInvoices[0];
            const pendingAmount = latestInvoice ? latestInvoice.amount - latestInvoice.paidAmount : 0;
            const status = latestInvoice ? latestInvoice.status : 'No Bill';

            let statusColor = 'text-rose-500';
            if (status === 'Paid') statusColor = 'text-emerald-500';
            else if (status === 'Partial') statusColor = 'text-amber-500';
            else if (status === 'No Bill') statusColor = 'text-slate-400';

            return (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onViewCustomer(customer.id)}
                className="card p-4 flex items-center justify-between hover:border-indigo-300 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
                    customer.status === 'Active' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {(customer.name || '?').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 truncate">{customer.name || 'Unnamed Customer'}</h4>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        customer.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {customer.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <p className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                        <Phone size={12} /> {customer.phone}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                        <Box size={12} /> <span className="truncate max-w-[80px] sm:max-w-none">{customer.boxNumber}</span>
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate max-w-[120px] sm:max-w-none">
                        <span className="opacity-50 shrink-0">•</span> <span className="truncate">{customer.city}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-2">
                  <div className="text-right hidden sm:block">
                    <div className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${statusColor}`}>
                      {status}
                    </div>
                    {pendingAmount > 0 && (
                      <p className="font-bold text-slate-700">₹{pendingAmount}</p>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <SearchIcon size={40} />
            </div>
            <div>
              <p className="text-slate-500 font-medium">No customers found matching "{query}"</p>
              <p className="text-sm text-slate-400">Try searching by name, phone, city or box number</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
