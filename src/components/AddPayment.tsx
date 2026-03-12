import React from 'react';
import { motion } from 'motion/react';
import { Save, Calendar, CreditCard, Info, Wallet } from 'lucide-react';
import { Customer, Invoice, PaymentMode } from '../types';

interface AddPaymentProps {
  invoiceId: string;
  customers: Customer[];
  invoices: Invoice[];
  onSave: (paymentData: any) => void;
  onCancel: () => void;
}

export default function AddPayment({ invoiceId, customers, invoices, onSave, onCancel }: AddPaymentProps) {
  const invoice = invoices.find(i => i.id === invoiceId);
  const customer = customers.find(c => c.id === invoice?.customerId);
  
  const pendingAmount = invoice ? invoice.amount - invoice.paidAmount : 0;
  
  const [amount, setAmount] = React.useState(pendingAmount > 0 ? pendingAmount.toString() : '');
  const [mode, setMode] = React.useState<PaymentMode>('Cash');
  const [remarks, setRemarks] = React.useState('');
  const [error, setError] = React.useState('');

  if (!invoice || !customer) return <div>Invoice not found</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pendingAmount === 0) {
      setError('Payment already done for this month.');
      return;
    }

    const payAmt = parseFloat(amount);
    if (!payAmt || payAmt <= 0) return;

    if (payAmt > pendingAmount) {
      setError(`Cannot accept amount greater than the pending amount (₹${pendingAmount}).`);
      return;
    }

    onSave({
      invoiceId,
      customerId: customer.id,
      amount: parseFloat(amount),
      mode,
      remarks
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-24 md:pb-8">
        {/* Invoice Summary Card */}
        <div className="card bg-slate-900 text-white border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Wallet size={80} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Billing Month</p>
                <h4 className="text-lg font-bold flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-400" />
                  {invoice.month}
                </h4>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</p>
                <p className="font-bold">{customer.name}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Bill</p>
                <p className="text-lg font-bold">₹{invoice.amount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Paid So Far</p>
                <p className="text-lg font-bold text-emerald-400">₹{invoice.paidAmount}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Pending</p>
                <p className="text-xl font-bold text-rose-400">₹{pendingAmount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="card space-y-6">
          {pendingAmount === 0 && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 flex items-center gap-3 font-semibold text-sm">
              Payment already done for this month.
            </div>
          )}

          {error && (
            <div className="bg-rose-50 text-rose-500 p-3 rounded-lg text-sm font-semibold border border-rose-100">
              {error}
            </div>
          )}

          <div>
            <label className="label">Payment Amount *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">₹</span>
              <input 
                type="number"
                className="input-field pl-10 text-xl font-bold text-indigo-600 disabled:opacity-50"
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                disabled={pendingAmount === 0}
                autoFocus
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
              <Info size={12} /> Enter the amount received from the customer
            </p>
          </div>

          <div>
            <label className="label">Payment Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Cash', 'UPI', 'Bank'] as PaymentMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`py-3 rounded-xl border font-bold transition-all flex flex-col items-center gap-1 ${
                    mode === m 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">{m}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Remarks (Optional)</label>
            <input 
              type="text"
              className="input-field"
              placeholder="e.g. Paid via PhonePe, Discount given, etc."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 md:relative md:bg-transparent md:border-0 md:p-0 flex gap-3 z-40">
          <button 
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1 md:flex-none md:w-32 py-3"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={pendingAmount === 0}
            className="btn-primary flex-1 md:flex-none md:w-48 py-3 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            Save Payment
          </button>
        </div>
      </form>
    </motion.div>
  );
}
