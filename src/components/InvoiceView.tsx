import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, Download, Share2, ChevronLeft, CheckCircle2, AlertCircle, MessageCircle, Mail, Copy, Loader2, Bluetooth } from 'lucide-react';
import { Customer, Invoice, Payment, PLANS } from '../types';
import { thermalPrinter } from '../utils/printer';

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
  const [isPrinting, setIsPrinting] = useState(false);

  if (!invoice || !customer) return <div>Invoice not found</div>;

  const balance = invoice.amount - invoice.paidAmount;

  // Receipt formatting utility for 32 chars width (58mm printer)
  const formatLine = (left: string, right: string) => {
    const spaces = 32 - (left.length + right.length);
    if (spaces > 0) return `${left}${' '.repeat(spaces)}${right}`;
    return `${left} ${right}`;
  };

  const generateReceiptText = (): string => {
    let receipt = '';
    // Header section (This will be BOLD and ALIGN_CENTER thanks to printer.ts logic)
    receipt += 'SURYA CABLE NETWORK\n';
    receipt += `Invoice No: ${invoice.id}\n`;
    receipt += `Date: ${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}\n`;
    receipt += '\n'; // Triggers BOLD_OFF and ALIGN_LEFT in printer utils
    receipt += `Name: ${customer.name}\n`;
    receipt += `Box No: ${customer.boxNumber}\n`;
    receipt += '--------------------------------\n';
    receipt += formatLine('Plan:', `Rs.${plan?.price || 0}`) + '\n';
    receipt += formatLine('Previous Due:', `Rs.${invoice.previousDue}`) + '\n';
    receipt += '--------------------------------\n';
    receipt += formatLine('TOTAL:', `Rs.${invoice.amount}`) + '\n';
    
    // Payments
    if (invoicePayments.length > 0) {
      receipt += '--------------------------------\n';
      invoicePayments.forEach(p => {
        const d = new Date(p.date).toLocaleDateString('en-GB').replace(/\//g, '-');
        receipt += formatLine(`Paid (${d}):`, `Rs.${p.amount}`) + '\n';
      });
    }

    receipt += '--------------------------------\n';
    receipt += formatLine('BALANCE:', `Rs.${balance}`) + '\n\n';
    receipt += '           Thank You            \n';
    return receipt;
  };

  const handlePrint = async () => {
    // Basic fallback for browsers that don't support Web Bluetooth (e.g Firefox, old Safari)
    if (!navigator.bluetooth) {
      window.print();
      return;
    }

    try {
      setIsPrinting(true);
      if (!thermalPrinter.isConnected()) {
        await thermalPrinter.connect();
      }
      await thermalPrinter.print(generateReceiptText());
    } catch (err: any) {
      console.error(err);
      if (err.message) {
         alert(err.message);
      }
    } finally {
      setIsPrinting(false);
    }
  };

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
          <button 
            onClick={handlePrint} 
            disabled={isPrinting}
            className="btn-primary shadow-lg shadow-indigo-100 min-w-[100px]"
          >
            {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
            {isPrinting ? 'Connecting...' : 'Print'}
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

      {/* Print Only Thermal View HTML Fallback */}
      <div className="print-only font-mono text-sm max-w-[320px] mx-auto p-4 bg-white text-black leading-tight">
        <div className="text-center font-bold mb-4">
          <img src="/logo.png" alt="Surya Cable Network Logo" className="w-16 h-16 mx-auto mb-2 grayscale object-contain" />
          <p className="text-lg">SURYA CABLE NETWORK</p>
        </div>
        
        <div className="mb-4">
          <p>Invoice No: {invoice.id}</p>
          <p>Date: {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</p>
        </div>

        <div className="mb-4">
          <p>Name: {customer.name}</p>
          <p>Box No: {customer.boxNumber}</p>
        </div>

        <div className="border-y border-black py-2 mb-2 space-y-1">
          <div className="flex justify-between">
            <span>Plan:</span>
            <span>Rs.{plan?.price}</span>
          </div>
          <div className="flex justify-between">
            <span>Previous Due:</span>
            <span>Rs.{invoice.previousDue}</span>
          </div>
        </div>

        <div className="flex justify-between font-bold text-base mb-2">
          <span>TOTAL:</span>
          <span>Rs.{invoice.amount}</span>
        </div>

        {invoicePayments.length > 0 && (
          <div className="border-t border-dashed border-black pt-2 mb-2 space-y-1 text-xs">
            {invoicePayments.map((p, i) => (
              <div key={i} className="flex justify-between">
                <span>Paid ({new Date(p.date).toLocaleDateString('en-GB')}):</span>
                <span>Rs.{p.amount}</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-y border-black py-2 mb-6">
          <div className="flex justify-between font-bold text-base">
            <span>BALANCE:</span>
            <span>Rs.{balance}</span>
          </div>
        </div>

        <div className="text-center italic mb-4">
          <p>*** Thank You ***</p>
        </div>
      </div>
    </div>
  );
}
