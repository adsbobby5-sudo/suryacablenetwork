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
      <div className="card bg-indigo-600 text-white border-none shadow-xl shadow-indigo-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <User size={120} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold">
              {(customer.name || '?').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{customer.name || 'Unnamed Customer'}</h3>
                <div className="flex gap-1">
                  <button 
                    onClick={onEdit}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                    title="Edit Customer"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-rose-500/30 text-white/70 hover:text-white transition-all"
                    title="Remove Customer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-indigo-100 flex items-center gap-1 text-sm mt-1">
                <Box size={14} /> Box: {customer.boxNumber} • ID: {customer.id}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Pending</p>
              <p className="text-xl font-bold">₹{totalPending}</p>
            </div>
            <div className={`px-4 py-2 rounded-xl text-center backdrop-blur-md ${
              customer.status === 'Active' ? 'bg-emerald-400/20 text-emerald-50' : 'bg-rose-400/20 text-rose-50'
            }`}>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status</p>
              <p className="text-xl font-bold">{customer.status}</p>
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
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id 
                ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card space-y-4">
                <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Contact Details</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 mt-0.5">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                      <p className="font-semibold text-slate-700">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 mt-0.5">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address & City</p>
                      <p className="font-semibold text-slate-700 leading-relaxed">
                        {customer.address}<br/>
                        <span className="text-indigo-600 font-bold">{customer.city}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card space-y-4">
                <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Plan & Billing</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-400 mt-0.5">
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Plan</p>
                      <p className="font-semibold text-slate-700">{plan?.name} (₹{plan?.price}/mo)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-400 mt-0.5">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Member Since</p>
                      <p className="font-semibold text-slate-700">{customer.createdAt}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {currentInvoice ? (
              <div className="card border-l-4 border-l-indigo-500 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-800">Current Month Bill</h4>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500 uppercase tracking-wider">
                      {currentInvoice.month}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">Total: ₹{currentInvoice.amount} • Paid: ₹{currentInvoice.paidAmount}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => onViewInvoice(currentInvoice.id)}
                    className="btn-secondary flex-1 md:flex-none"
                  >
                    <FileText size={18} />
                    Invoice
                  </button>
                  <button 
                    onClick={() => onAddPayment(currentInvoice.id)}
                    className="btn-primary flex-1 md:flex-none shadow-lg shadow-indigo-100"
                  >
                    <Plus size={18} />
                    Add Payment
                  </button>
                </div>
              </div>
            ) : (
              <div className="card border-l-4 border-l-slate-200 border-dashed flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">No Active Bill Found</h4>
                  <p className="text-sm text-slate-500">Generate a bill for the current month to start accepting payments.</p>
                </div>
                <button 
                  onClick={() => onGenerateInvoice(customer.id, plan?.price || 0)}
                  className="btn-primary flex-1 md:flex-none shadow-lg shadow-indigo-200"
                >
                  <Plus size={18} />
                  Generate Bill
                </button>
              </div>
            )}

          </>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                onClick={() => onViewInvoice(invoice.id)}
                className="card p-4 flex items-center justify-between hover:border-indigo-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-500' : 
                    invoice.status === 'Partial' ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'
                  }`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{invoice.month}</p>
                    <p className="text-xs text-slate-400">ID: {invoice.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-slate-800">₹{invoice.amount}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${
                      invoice.status === 'Paid' ? 'text-emerald-500' : 
                      invoice.status === 'Partial' ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {invoice.status}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <History size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">₹{payment.amount}</p>
                    <p className="text-xs text-slate-400">{payment.date} • {payment.mode}</p>
                  </div>
                </div>
                {payment.remarks && (
                  <p className="text-xs italic text-slate-400 max-w-[150px] truncate">{payment.remarks}</p>
                )}
              </div>
            ))}
            {payments.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <History size={40} className="mx-auto mb-3 opacity-20" />
                <p>No payment history found</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

