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
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Month:</span>
          <select className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer">
            <option>March 2024</option>
            <option>February 2024</option>
            <option>January 2024</option>
          </select>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card flex flex-col justify-between"
          >
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-tight">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {financialStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (idx + 4) * 0.1 }}
            className="card flex items-center gap-4"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              Recent Payments
            </h3>
            <button onClick={onViewAll} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {recentPayments.map((payment) => {
              const customer = customers.find(c => c.id === payment.customerId);
              return (
                <div key={payment.id} className="card p-3 flex items-center justify-between hover:border-indigo-200 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                      {(customer?.name || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{customer?.name || 'Unknown Customer'}</p>
                      <p className="text-xs text-slate-400">{payment.date} • {payment.mode}</p>
                    </div>
                  </div>
                  <p className="font-bold text-emerald-600">₹{payment.amount}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Bills */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-500" />
              Pending Bills
            </h3>
            <button onClick={onViewAll} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {pendingCustomers.map((invoice) => {
              const customer = customers.find(c => c.id === invoice.customerId);
              return (
                <div 
                  key={invoice.id} 
                  onClick={() => onViewCustomer(customer!.id)}
                  className="card p-3 flex items-center justify-between hover:border-rose-200 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold">
                      {(customer?.name || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{customer?.name || 'Unknown Customer'}</p>
                      <p className="text-xs text-slate-400">Box: {customer?.boxNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-bold text-rose-600">₹{invoice.amount - invoice.paidAmount}</p>
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter">Pending</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-rose-400 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={onAddCustomer}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center active:scale-90 transition-transform z-50"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
