import React from 'react';
import { motion } from 'motion/react';
import { Download, FileText, Calendar, Filter, ChevronDown, Search } from 'lucide-react';
import { Customer, Invoice, Payment } from '../types';

interface ReportsProps {
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
}

export default function Reports({ customers, invoices }: ReportsProps) {
  const [activeTab, setActiveTab] = React.useState('monthly');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedMonth, setSelectedMonth] = React.useState('All');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);

  // Filter out invoices where the customer is deleted
  const validInvoices = invoices.filter(invoice => 
    customers.some(c => c.id === invoice.customerId)
  );

  const reportData = validInvoices.map(invoice => {
    const customer = customers.find(c => c.id === invoice.customerId);
    
    // Convert YYYY-MM to a more readable date format (e.g., "March 2026")
    const dateObj = new Date(invoice.month + '-01');
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
      customer: customer?.name || 'Unknown',
      boxNumber: customer?.boxNumber || 'N/A',
      city: customer?.city || 'N/A',
      month: invoice.month, // Keep original for filtering logic
      displayDate: formattedDate,
      bill: invoice.amount,
      paid: invoice.paidAmount,
      pending: invoice.amount - invoice.paidAmount
    };
  });

  const availableMonths = ['All', ...Array.from(new Set(reportData.map(r => r.month)))];

  const filteredData = reportData.filter(row => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      row.customer.toLowerCase().includes(term) ||
      row.boxNumber.toLowerCase().includes(term) ||
      row.city.toLowerCase().includes(term) ||
      row.displayDate.toLowerCase().includes(term) ||
      row.bill.toString().includes(term) ||
      row.paid.toString().includes(term) ||
      row.pending.toString().includes(term);
      
    let matchesTimeframe = true;
    if (activeTab === 'monthly') {
      matchesTimeframe = selectedMonth === 'All' || row.month === selectedMonth;
    } else if (activeTab === 'range') {
      if (startDate && endDate) {
        const rowDate = new Date(row.month + '-01');
        const start = new Date(startDate);
        const end = new Date(endDate);
        matchesTimeframe = rowDate >= start && rowDate <= end;
      }
    }

    return matchesSearch && matchesTimeframe;
  });

  const totals = filteredData.reduce((acc, curr) => ({
    bill: acc.bill + curr.bill,
    paid: acc.paid + curr.paid,
    pending: acc.pending + curr.pending
  }), { bill: 0, paid: 0, pending: 0 });

  const handleExport = () => {
    if (filteredData.length === 0) return;
    
    // Create CSV header
    const headers = ['Customer', 'Box Number', 'City', 'Date', 'Bill Amount', 'Paid Amount', 'Pending Amount'];
    
    // Create CSV rows
    const rows = filteredData.map(row => 
      [
        `"${row.customer}"`, 
        `"${row.boxNumber}"`, 
        `"${row.city}"`, 
        `"${row.displayDate}"`, 
        row.bill, 
        row.paid, 
        row.pending
      ].join(',')
    );
    
    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Create Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'reports_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 w-full max-w-sm">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
            activeTab === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Monthly Report
        </button>
        <button
          onClick={() => setActiveTab('range')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
            activeTab === 'range' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Date Range
        </button>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Field */}
        <div className="flex-1 flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white shadow-sm focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/30 transition-all">
          <Search size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search reports..." 
            className="bg-transparent flex-1 font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'range' && (
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white shadow-sm max-w-md focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/30 transition-all">
            <Calendar size={20} className="text-indigo-500" />
            <div className="flex-1 flex items-center gap-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none w-full cursor-pointer"
              />
              <span className="text-slate-300 font-bold px-1">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none w-full cursor-pointer" 
              />
            </div>
          </div>
        )}

        {activeTab === 'monthly' && (
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all ${showFilters ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm'}`}
          >
            <Filter size={18} />
            Filters
          </button>
        )}
        <button onClick={handleExport} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98] transition-all">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Expandable Filters Section (Monthly Only) */}
      {showFilters && activeTab === 'monthly' && (
        <motion.div 
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <div className="flex-1 flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white shadow-sm max-w-sm focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/30 transition-all">
            <Calendar size={20} className="text-indigo-500" />
            <select 
              className="bg-transparent flex-1 font-bold text-slate-700 focus:outline-none cursor-pointer appearance-none"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map(month => {
                const display = month === 'All' ? 'All Months' : new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                return <option key={month} value={month}>{display}</option>;
              })}
            </select>
            <ChevronDown size={18} className="text-slate-400 pointer-events-none" />
          </div>
        </motion.div>
      )}

      {/* Report Table / List */}
      <div className="card p-0 overflow-hidden border border-white/60 bg-white/80 backdrop-blur-xl">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Customer</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Box #</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">City</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Bill</th>
                <th className="px-6 py-5 text-xs font-bold text-emerald-600 uppercase tracking-widest whitespace-nowrap text-right">Paid</th>
                <th className="px-6 py-5 text-xs font-bold text-rose-600 uppercase tracking-widest whitespace-nowrap text-right">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredData.map((row, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap group-hover:text-indigo-900 transition-colors">{row.customer}</td>
                  <td className="px-6 py-4 font-semibold text-slate-600 font-mono text-sm">{row.boxNumber}</td>
                  <td className="px-6 py-4 font-semibold text-slate-600">{row.city}</td>
                  <td className="px-6 py-4 font-semibold text-slate-500 text-sm">{row.displayDate}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-right">₹{row.bill.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600 bg-emerald-50/30 text-right">₹{row.paid.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-rose-600 bg-rose-50/30 text-right">₹{row.pending.toLocaleString()}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                     No reports found matching your criteria.
                   </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-indigo-50/80 to-violet-50/80 border-t-2 border-indigo-100">
                <td colSpan={4} className="px-6 py-5 font-black text-indigo-800 uppercase tracking-widest text-sm text-right">Grand Total</td>
                <td className="px-6 py-5 font-black text-slate-900 text-right text-lg">₹{totals.bill.toLocaleString()}</td>
                <td className="px-6 py-5 font-black text-emerald-700 text-right text-lg">₹{totals.paid.toLocaleString()}</td>
                <td className="px-6 py-5 font-black text-rose-700 text-right text-lg">₹{totals.pending.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile List View */}
        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-slate-100/50 bg-slate-50/30">
          {filteredData.map((row, idx) => (
            <div key={idx} className="p-5 space-y-3 hover:bg-white transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{row.customer}</h4>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold tracking-widest uppercase border border-slate-200/60">Box {row.boxNumber}</span>
                     <span className="text-xs font-semibold text-slate-400">{row.city}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">{row.displayDate}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Bill</p>
                  <p className="font-bold text-slate-700">₹{row.bill.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Paid</p>
                  <p className="font-bold text-emerald-600">₹{row.paid.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Pending</p>
                  <p className="font-bold text-rose-600">₹{row.pending.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredData.length === 0 && (
             <div className="p-8 text-center text-slate-500 font-medium">
                No reports found matching your criteria.
             </div>
          )}
          <div className="p-5 bg-gradient-to-br from-indigo-50 to-violet-50 border-t-2 border-indigo-100">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-1">
              <FileText size={14} /> Grand Total Summary
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5 border border-white shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Bill</p>
                <p className="text-sm font-black text-slate-800">₹{totals.bill.toLocaleString()}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5 border border-white shadow-sm">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">Total Paid</p>
                <p className="text-sm font-black text-emerald-600">₹{totals.paid.toLocaleString()}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5 border border-white shadow-sm text-right">
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-0.5">Total Pend</p>
                <p className="text-sm font-black text-rose-600">₹{totals.pending.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
