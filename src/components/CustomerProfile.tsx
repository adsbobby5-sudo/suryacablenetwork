import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Phone, 
  MapPin, 
  Box, 
  CreditCard, 
  Calendar, 
  Plus, 
  FileText, 
  History,
  ChevronRight,
  Trash2,
  AlertTriangle,
  Edit2
} from 'lucide-react';
import { IndianRupee } from './Icons';
import { Customer, Invoice, Payment, PLANS } from '../types';

interface CustomerProfileProps {
  customerId: string;
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
  onAddPayment: (invoiceId: string) => void;
  onViewInvoice: (invoiceId: string) => void;
  onRemove: () => void;
  onEdit: () => void;
  onGenerateInvoice: (customerId: string, amount: number) => void;
}

export default function CustomerProfile({ 
  customerId, 
  customers, 
  invoices: allInvoices, 
  payments: allPayments, 
  onAddPayment, 
  onViewInvoice, 
  onRemove, 
  onEdit,
  onGenerateInvoice
}: CustomerProfileProps) {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return <div>Customer not found</div>;

  const plan = PLANS.find(p => p.id === customer.planId);
  const invoices = allInvoices.filter(i => i.customerId === customerId).sort((a, b) => b.month.localeCompare(a.month));
  const payments = allPayments.filter(p => p.customerId === customerId).sort((a, b) => b.date.localeCompare(a.date));
  
  const currentInvoice = invoices[0]; // Assume latest is current
  const totalPending = invoices.reduce((acc, inv) => acc + (inv.amount - inv.paidAmount), 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'payments', label: 'Payments', icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Customer Header Card */}
      <div className="card bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-xl shadow-indigo-200 overflow-hidden relative p-8">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <User size={160} className="-rotate-12 translate-x-4 -translate-y-4" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl font-extrabold shadow-inner">
              {(customer.name || '?').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">{customer.name || 'Unnamed Customer'}</h3>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                  <button 
                    onClick={onEdit}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-all backdrop-blur-sm"
                    title="Edit Customer"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 transition-all backdrop-blur-sm"
                    title="Remove Customer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-lg text-indigo-50 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase border border-white/10">
                  <Box size={14} /> Box {customer.boxNumber}
                </p>
                <p className="text-indigo-200 text-sm font-medium">Customer ID: {customer.id}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center shadow-lg">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-0.5">Total Pending</p>
              <p className="text-2xl font-black tracking-tight text-white drop-shadow-sm">₹{totalPending.toLocaleString()}</p>
            </div>
            <div className={`px-6 py-3 rounded-2xl text-center backdrop-blur-md border shadow-lg ${
              customer.status === 'Active' ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-50' : 'bg-rose-500/20 border-rose-400/30 text-rose-50'
            }`}>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">Account Status</p>
              <p className="text-lg font-bold tracking-wide">{customer.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Remove Customer?</h3>
            <p className="text-slate-500 text-center mb-6">
              Are you sure you want to remove <strong>{customer.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1 py-3"
              >
                Cancel
              </button>
              <button 
                onClick={onRemove}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-xl flex-1 transition-all shadow-lg shadow-rose-100"
              >
                Remove
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              activeTab === tab.id 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={18} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="card space-y-5 bg-white/60 backdrop-blur-sm border-white/60">
                <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <User size={18} className="text-indigo-500" />
                  Contact Details
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                      <p className="font-bold text-slate-800 text-lg">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-sm">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Address & City</p>
                      <p className="font-semibold text-slate-700 leading-relaxed text-sm">
                        {customer.address}<br/>
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md mt-1 font-bold text-xs uppercase tracking-wider">
                          <MapPin size={10} /> {customer.city}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card space-y-5 bg-white/60 backdrop-blur-sm border-white/60">
                <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <CreditCard size={18} className="text-emerald-500" />
                  Plan & History
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm">
                      <Box size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Current Plan</p>
                      <div className="flex items-baseline gap-2">
                         <p className="font-bold text-slate-800 text-lg">{plan?.name}</p>
                         <p className="text-sm font-bold text-emerald-600">₹{plan?.price}<span className="text-xs text-slate-400 font-semibold">/mo</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Member Since</p>
                      <p className="font-bold text-slate-800 text-lg">{new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {currentInvoice ? (
              <div className="card bg-gradient-to-r from-indigo-50 to-white border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-extrabold text-slate-800 text-xl tracking-tight">Active Billing Cycle</h4>
                    <span className="text-[10px] bg-indigo-100/80 px-2.5 py-1 rounded-lg font-bold text-indigo-600 uppercase tracking-widest border border-indigo-200/50">
                      {currentInvoice.month}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                       <p className="font-black text-slate-800 text-lg">₹{currentInvoice.amount.toLocaleString()}</p>
                     </div>
                     <div className="w-px h-8 bg-slate-200" />
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Paid So Far</p>
                       <p className="font-black text-emerald-600 text-lg">₹{currentInvoice.paidAmount.toLocaleString()}</p>
                     </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 relative">
                  <button 
                    onClick={() => onViewInvoice(currentInvoice.id)}
                    className="btn-secondary w-full sm:w-auto"
                  >
                    <FileText size={18} />
                    View Details
                  </button>
                  <button 
                    onClick={() => onAddPayment(currentInvoice.id)}
                    className="btn-primary w-full sm:w-auto shadow-lg shadow-indigo-200"
                  >
                    <Plus size={18} />
                    Record Payment
                  </button>
                </div>
              </div>
            ) : (
              <div className="card border border-dashed border-slate-300 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">No Active Bill Generated</h4>
                    <p className="text-sm font-medium text-slate-500">Create a new bill for the current month to start accepting payments from this customer.</p>
                  </div>
                </div>
                <button 
                  onClick={() => onGenerateInvoice(customer.id, plan?.price || 0)}
                  className="btn-primary flex-1 md:flex-none shadow-lg shadow-indigo-200 py-3 px-6 whitespace-nowrap"
                >
                  <Plus size={20} />
                  Generate New Bill
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                onClick={() => onViewInvoice(invoice.id)}
                className="card p-4 flex items-center justify-between hover:border-indigo-100 transition-all cursor-pointer group hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100' : 
                    invoice.status === 'Partial' ? 'bg-amber-50 text-amber-500 group-hover:bg-amber-100' : 'bg-rose-50 text-rose-500 group-hover:bg-rose-100'
                  }`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg group-hover:text-indigo-900 transition-colors">{invoice.month}</p>
                    <p className="text-xs font-semibold text-slate-400 font-mono mt-0.5">ID: {invoice.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-lg">₹{invoice.amount.toLocaleString()}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${
                      invoice.status === 'Paid' ? 'text-emerald-500' : 
                      invoice.status === 'Partial' ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {invoice.status}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="card p-12 text-center border-dashed border-slate-200">
                <FileText size={48} className="mx-auto mb-4 text-slate-200" />
                <h4 className="font-bold text-slate-800 text-lg mb-1">No Invoices Yet</h4>
                <p className="text-slate-500">This customer doesn't have any billing history.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {payments.map((payment) => (
              <div key={payment.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition-colors">
                    <History size={20} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-lg">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{payment.date} • {payment.mode}</p>
                  </div>
                </div>
                {payment.remarks && (
                  <div className="bg-slate-50 px-3 py-2 rounded-xl sm:max-w-[200px] border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 truncate" title={payment.remarks}>
                      "{payment.remarks}"
                    </p>
                  </div>
                )}
              </div>
            ))}
            {payments.length === 0 && (
              <div className="card p-12 text-center border-dashed border-slate-200">
                <History size={48} className="mx-auto mb-4 text-slate-200" />
                <h4 className="font-bold text-slate-800 text-lg mb-1">No Payments Yet</h4>
                <p className="text-slate-500">No payment records found for this customer.</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

