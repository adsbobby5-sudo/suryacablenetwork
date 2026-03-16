import React from 'react';
import { motion } from 'motion/react';
import { Search as SearchIcon, User, Phone, Box, ChevronRight, X, CreditCard } from 'lucide-react';
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
      (c.cardNumber || '').toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q) ||
      (c.id || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="sticky top-[60px] md:top-[72px] z-30 -mx-4 px-4 py-4 sm:py-6 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 md:bg-transparent md:border-0 md:p-0 md:mx-0 md:mb-6">
        <div className="relative group max-w-2xl mx-auto md:max-w-none">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={22} />
          <input 
            type="text"
            placeholder="Search by Name, Phone, Card #, Box #, City, or ID..."
            className="w-full pl-14 pr-14 py-4.5 rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all text-lg font-medium text-slate-800 placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
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

            let statusColor = 'text-rose-500 bg-rose-50';
            if (status === 'Paid') statusColor = 'text-emerald-500 bg-emerald-50';
            else if (status === 'Partial') statusColor = 'text-amber-500 bg-amber-50';
            else if (status === 'No Bill') statusColor = 'text-slate-500 bg-slate-100';

            return (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => onViewCustomer(customer.id)}
                className="card p-4 sm:p-5 flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5 bg-white/80 backdrop-blur-sm border-white/60"
              >
                <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 transition-colors shadow-sm ${
                    customer.status === 'Active' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {(customer.name || '?').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-800 text-lg truncate group-hover:text-indigo-900 transition-colors">{customer.name || 'Unnamed Customer'}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest shrink-0 border ${
                        customer.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60' : 'bg-rose-50 text-rose-600 border-rose-200/60'
                      }`}>
                        {customer.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2 py-0.5 rounded-md">
                        <Phone size={12} className="text-slate-400" /> {customer.phone}
                      </p>
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2 py-0.5 rounded-md">
                        <Box size={12} className="text-slate-400" /> <span className="truncate max-w-[80px] sm:max-w-none">Box {customer.boxNumber}</span>
                      </p>
                      {customer.cardNumber && (
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2 py-0.5 rounded-md">
                          <CreditCard size={12} className="text-slate-400" /> <span className="truncate max-w-[90px] sm:max-w-none">Card {customer.cardNumber}</span>
                        </p>
                      )}
                      <p className="text-xs font-bold text-indigo-500 flex items-center gap-1.5 truncate max-w-[120px] sm:max-w-none bg-indigo-50/50 px-2 py-0.5 rounded-md">
                        <span className="truncate">{customer.city}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 shrink-0 pl-3 border-l border-slate-100 ml-3">
                  <div className="text-right hidden sm:block">
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 px-2.5 py-1 rounded-lg inline-block ${statusColor}`}>
                      {status}
                    </div>
                    {pendingAmount > 0 ? (
                      <p className="font-black text-rose-600 text-lg">₹{pendingAmount.toLocaleString()}</p>
                    ) : (
                      <p className="font-bold text-slate-300 text-sm">Settled</p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                     <ChevronRight size={20} className="text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-24 text-center space-y-4">
            <div className="w-24 h-24 bg-slate-100/50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <SearchIcon size={48} className="opacity-50" />
            </div>
            <div>
              <p className="text-slate-600 font-bold text-lg mb-1">No customers found</p>
              <p className="text-sm font-medium text-slate-400">Try searching by name, phone, card #, city or box number</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
