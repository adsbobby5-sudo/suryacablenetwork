import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, Download, Share2, ChevronLeft, CheckCircle2, AlertCircle, MessageCircle, Mail, Copy } from 'lucide-react';
import { Customer, Invoice, Payment, PLANS } from '../types';

interface InvoiceViewProps {
  invoiceId: string;
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
  onBack: () => void;
}

export default function InvoiceView({ invoiceId, customers, invoices, payments, onBack }: InvoiceViewProps) {
  const invoice = invoices.find(i => i.id === invoiceId);
  const customer = customers.find(c => c.id === invoice?.customerId);
  const plan = PLANS.find(p => p.id === customer?.planId);
  
  const invoicePayments = payments.filter(p => p.invoiceId === invoiceId).sort((a, b) => a.date.localeCompare(b.date));

  const [showShareMenu, setShowShareMenu] = useState(false);

  if (!invoice || !customer) return <div>Invoice not found</div>;

  const handlePrint = () => {
    window.print();
  };

  const balance = invoice.amount - invoice.paidAmount;

  const shareText = `*Surya Cable Network - Invoice*
Customer: ${customer.name}
Box Number: ${customer.boxNumber}
Billing Month: ${invoice.month}

Total Amount: ₹${invoice.amount}.00
Paid Amount: ₹${invoice.paidAmount}.00
Balance Due: ₹${balance}.00

Thank you for your business!`;

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleEmailShare = () => {
    window.open(`mailto:?subject=Invoice from Surya Cable Network&body=${encodeURIComponent(shareText)}`);
    setShowShareMenu(false);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setShowShareMenu(false);
    alert('Invoice details copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between no-print">
        <button onClick={onBack} className="btn-secondary">
          <ChevronLeft size={18} />
          Back
        </button>
        <div className="flex gap-2">
          <div className="relative">
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="btn-secondary p-2 sm:px-4" 
              title="Share options"
            >
              <Share2 size={18} />
              <span className="hidden sm:inline">Share</span>
            </button>

            <AnimatePresence>
              {showShareMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40 no-print" 
                    onClick={() => setShowShareMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 no-print"
                  >
                    <div className="p-1 flex flex-col">
                      <button 
                        onClick={handleWhatsAppShare}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors rounded-lg w-full text-left"
                      >
                        <MessageCircle size={16} />
                        WhatsApp
                      </button>
                      <button 
                        onClick={handleEmailShare}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors rounded-lg w-full text-left"
                      >
                        <Mail size={16} />
                        Email
                      </button>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button 
                        onClick={handleCopyText}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-lg w-full text-left"
                      >
                        <Copy size={16} />
                        Copy Details
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <button onClick={handlePrint} className="btn-primary shadow-lg shadow-indigo-100">
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto no-print"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Surya Cable Network Logo" className="w-32 h-32 sm:w-40 sm:h-40 object-contain bg-white rounded-xl p-2 shadow-sm" />
              <div>
                <div className="space-y-1 text-slate-300 text-sm">
                  <p className="font-bold text-white text-lg">N.prasad</p>
                  <p>Rama Chandra puram, Fatima medical College</p>
                  <p>CK din Mandal, Kadapa, 516003</p>
                  <p>Phone: +91 9000944090</p>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider mb-4 ${
                invoice.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {invoice.status === 'Paid' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {invoice.status}
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Invoice Number</p>
              <p className="text-xl font-mono font-bold">{invoice.id}</p>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-4">Billing Month</p>
              <p className="text-lg font-bold">{invoice.month}</p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="p-8 sm:p-12 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bill To</p>
            <h3 className="text-xl font-bold text-slate-800">{customer.name}</h3>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">{customer.address}</p>
            <p className="text-slate-500 text-sm mt-1">Phone: {customer.phone}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Connection Info</p>
            <p className="text-slate-700 font-bold">Box Number: <span className="font-mono">{customer.boxNumber}</span></p>
            <p className="text-slate-700 font-bold">Plan: {plan?.name}</p>
            <p className="text-slate-700 font-bold">Customer ID: {customer.id}</p>
          </div>
        </div>

        {/* Table */}
        <div className="p-8 sm:p-12">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Monthly Subscription ({invoice.month})</span>
              <span className="font-bold text-slate-800">₹{plan?.price}.00</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Previous Due</span>
              <span className="font-bold text-slate-800">₹{invoice.previousDue}.00</span>
            </div>
            
            <div className="pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total Amount</span>
                <span className="text-2xl font-black text-slate-900">₹{invoice.amount}.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total Paid</span>
                <span className="text-lg font-bold text-emerald-600">₹{invoice.paidAmount}.00</span>
              </div>
              
              {invoicePayments.length > 0 && (
                <div className="pt-2 pb-1 space-y-2">
                  {invoicePayments.map((p, i) => (
                    <div key={i} className="flex justify-between items-center bg-emerald-50/50 px-3 py-2 rounded-lg border border-emerald-100/50">
                      <span className="text-emerald-700 font-bold uppercase text-[10px] tracking-widest">Payment ({new Date(p.date).toLocaleDateString('en-GB')})</span>
                      <span className="text-sm font-bold text-emerald-700">₹{p.amount}.00</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-indigo-600 font-bold uppercase text-sm tracking-widest">Balance Due</span>
                <span className="text-2xl font-black text-indigo-600">₹{balance}.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-8 text-center">
          <p className="text-slate-400 text-xs font-medium">This is a computer generated invoice. No signature required.</p>
          <p className="text-indigo-600 font-bold text-sm mt-2">Thank you for choosing Surya Cable Network!</p>
        </div>
      </motion.div>

      {/* Print Only View (Simplified) */}
      <div className="print-only p-10 text-slate-900 font-sans">
        <div className="text-center mb-10 flex flex-col items-center">
          <img src="/logo.png" alt="Surya Cable Network Logo" className="w-40 h-40 object-contain mb-4" />
          <p className="text-xs text-slate-600 font-bold">N.prasad, Rama Chandra puram, Fatima medical College, CK din Mandal, Kadapa - 516003. Ph: 9000944090</p>
          <p className="text-sm uppercase tracking-widest mt-4">Invoice for {invoice.month}</p>
        </div>
        <div className="flex justify-between mb-10">
          <div>
            <h3 className="font-bold text-lg">{customer.name}</h3>
            <p className="text-sm">{customer.address}</p>
            <p className="text-sm">Box: {customer.boxNumber}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">Invoice ID: {invoice.id}</p>
            <p className="font-bold">Billing Month: {invoice.month}</p>
          </div>
        </div>
        <table className="w-full mb-10 border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="py-4">Monthly Subscription - {plan?.name}</td>
              <td className="text-right py-4">₹{plan?.price}.00</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-4">Previous Due</td>
              <td className="text-right py-4">₹{invoice.previousDue}.00</td>
            </tr>
            <tr className="font-bold text-lg border-b border-slate-200">
              <td className="py-4">Total Amount</td>
              <td className="text-right py-4">₹{invoice.amount}.00</td>
            </tr>
            <tr className="font-bold text-slate-700">
              <td className="py-2 pt-4">Total Paid</td>
              <td className="text-right py-2 pt-4 font-bold text-emerald-600">₹{invoice.paidAmount}.00</td>
            </tr>
            {invoicePayments.map((p, i) => (
              <tr key={i} className="text-slate-500 text-sm">
                <td className="py-1 pl-4 border-l-2 border-emerald-500">Payment on {new Date(p.date).toLocaleDateString('en-GB')}</td>
                <td className="text-right py-1">₹{p.amount}.00</td>
              </tr>
            ))}
            <tr className="font-black text-2xl border-t-2 border-slate-900">
              <td className="py-4">Balance Due</td>
              <td className="text-right py-4">₹{balance}.00</td>
            </tr>
          </tbody>
        </table>
        <div className="text-center mt-20">
          <p className="font-bold">Authorized Signatory</p>
          <div className="h-20"></div>
          <p className="text-xs text-slate-400 italic">Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}
