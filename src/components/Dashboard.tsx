import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Plus,
  ChevronRight
} from 'lucide-react';
import { IndianRupee } from './Icons';
import { Customer, Invoice, Payment } from '../types';

interface DashboardProps {
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
  onAddCustomer: () => void;
  onViewCustomer: (id: string) => void;
  onViewAll?: () => void;
}

export default function Dashboard({ customers, invoices, payments, onAddCustomer, onViewCustomer, onViewAll }: DashboardProps) {
  // Filter out orphaned data from deleted customers
  const validInvoices = invoices.filter(i => customers.some(c => c.id === i.customerId));
  const validPayments = payments.filter(p => customers.some(c => c.id === p.customerId));

  const stats = [
    { label: 'Total Customers', value: customers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Paid', value: validInvoices.filter(i => i.status === 'Paid').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Partial', value: validInvoices.filter(i => i.status === 'Partial').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Unpaid', value: validInvoices.filter(i => i.status === 'Unpaid').length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const financialStats = [
    { label: 'Total Collection', value: `₹${validPayments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}`, icon: IndianRupee, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Pending', value: `₹${validInvoices.reduce((acc, i) => acc + (i.amount - i.paidAmount), 0).toLocaleString()}`, icon: TrendingUp, color: 'text-slate-600', bg: 'bg-slate-50' },
  ];

  const recentPayments = [...validPayments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const pendingCustomers = validInvoices
    .filter(i => i.status !== 'Paid')
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-20 md:pb-6">
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">Overview</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Here's what's happening with your network today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Month</span>
          <select className="bg-transparent font-bold text-indigo-600 focus:outline-none cursor-pointer">
            <option>March 2024</option>
            <option>February 2024</option>
            <option>January 2024</option>
          </select>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card flex flex-col justify-between group cursor-pointer"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 shadow-sm inner-shadow`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {financialStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (idx + 4) * 0.1 }}
            className="card flex items-center gap-5 group cursor-pointer"
          >
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-sm`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        {/* Recent Payments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-500" />
              Recent Payments
            </h3>
            <button onClick={onViewAll} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">View All</button>
          </div>
          <div className="space-y-3">
            {recentPayments.map((payment) => {
              const customer = customers.find(c => c.id === payment.customerId);
              return (
                <div key={payment.id} className="card p-4 flex items-center justify-between hover:border-indigo-100 transition-all cursor-pointer group hover:-translate-y-0.5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {(customer?.name || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-base group-hover:text-indigo-900 transition-colors">{customer?.name || 'Unknown Customer'}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{payment.date} • {payment.mode}</p>
                    </div>
                  </div>
                  <p className="font-bold text-emerald-600 text-lg">₹{payment.amount}</p>
                </div>
              );
            })}
            {recentPayments.length === 0 && (
              <div className="card p-8 text-center border-dashed">
                <p className="text-slate-500 font-medium">No recent payments to display.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Bills */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle size={20} className="text-rose-500" />
              Action Needed
            </h3>
            <button onClick={onViewAll} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">View All</button>
          </div>
          <div className="space-y-3">
            {pendingCustomers.map((invoice) => {
              const customer = customers.find(c => c.id === invoice.customerId);
              return (
                <div 
                  key={invoice.id} 
                  onClick={() => onViewCustomer(customer!.id)}
                  className="card p-4 flex items-center justify-between hover:border-rose-100 transition-all cursor-pointer group hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-lg group-hover:bg-rose-100 transition-colors">
                      {(customer?.name || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-base group-hover:text-rose-900 transition-colors">{customer?.name || 'Unknown Customer'}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">Box: {customer?.boxNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-rose-600 text-lg">₹{invoice.amount - invoice.paidAmount}</p>
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-0.5">Pending</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-rose-500 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
             {pendingCustomers.length === 0 && (
              <div className="card p-8 text-center border-dashed">
                <p className="text-emerald-500 font-medium">All caught up! No pending bills.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={onAddCustomer}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl shadow-xl shadow-indigo-500/30 flex items-center justify-center active:scale-95 transition-transform z-50"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
