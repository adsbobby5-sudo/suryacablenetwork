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
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'monthly' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'
          }`}
        >
          Monthly Report
        </button>
        <button
          onClick={() => setActiveTab('range')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'range' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'
          }`}
        >
          Date Range
        </button>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Field */}
        <div className="flex-1 flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by field..." 
            className="bg-transparent flex-1 font-semibold text-slate-700 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'range' && (
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm max-w-md">
            <Calendar size={18} className="text-slate-400" />
            <div className="flex-1 flex items-center gap-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none w-full"
              />
              <span className="text-slate-400 font-bold">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none w-full" 
              />
            </div>
          </div>
        )}

        {activeTab === 'monthly' && (
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary py-3 ${showFilters ? 'bg-slate-100' : ''}`}
          >
            <Filter size={18} />
            Filters
          </button>
        )}
        <button onClick={handleExport} className="btn-primary py-3 shadow-lg shadow-indigo-100">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Expandable Filters Section (Monthly Only) */}
      {showFilters && activeTab === 'monthly' && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm max-w-sm">
            <Calendar size={18} className="text-slate-400" />
            <select 
              className="bg-transparent flex-1 font-semibold text-slate-700 focus:outline-none cursor-pointer"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map(month => {
                const display = month === 'All' ? 'All Months' : new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                return <option key={month} value={month}>{display}</option>;
              })}
            </select>
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </motion.div>
      )}

      {/* Report Table / List */}
      <div className="card p-0 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Box #</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">City</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Bill</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Paid</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{row.customer}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{row.boxNumber}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{row.city}</td>
                  <td className="px-6 py-4 text-slate-500 font-medium text-sm">{row.displayDate}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">₹{row.bill}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">₹{row.paid}</td>
                  <td className="px-6 py-4 font-bold text-rose-600">₹{row.pending}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-50/50 border-t-2 border-indigo-100">
                <td colSpan={4} className="px-6 py-4 font-black text-indigo-600 uppercase tracking-widest text-sm text-right">Grand Total</td>
                <td className="px-6 py-4 font-black text-slate-900">₹{totals.bill}</td>
                <td className="px-6 py-4 font-black text-emerald-600">₹{totals.paid}</td>
                <td className="px-6 py-4 font-black text-rose-600">₹{totals.pending}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredData.map((row, idx) => (
            <div key={idx} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800">{row.customer}</h4>
                  <p className="text-xs text-slate-500">{row.boxNumber} • {row.city}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.displayDate}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Bill</p>
                  <p className="font-bold text-slate-700">₹{row.bill}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Paid</p>
                  <p className="font-bold text-emerald-600">₹{row.paid}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Pending</p>
                  <p className="font-bold text-rose-600">₹{row.pending}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="p-4 bg-indigo-50/50">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Grand Total Summary</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Bill</p>
                <p className="text-lg font-black text-slate-900">₹{totals.bill}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Paid</p>
                <p className="text-lg font-black text-emerald-600">₹{totals.paid}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Pending</p>
                <p className="text-lg font-black text-rose-600">₹{totals.pending}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
