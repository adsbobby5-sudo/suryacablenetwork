import React from 'react';
import { motion } from 'motion/react';
import { Save, User, Phone, MapPin, Box, CreditCard, Activity, Building2 } from 'lucide-react';
import { IndianRupee } from './Icons';
import { PLANS, Customer } from '../types';

interface AddCustomerProps {
  onSave: (customerData: any) => void;
  onCancel: () => void;
  customer?: Customer;
  existingCustomers: Customer[];
}

export default function AddCustomer({ onSave, onCancel, customer, existingCustomers }: AddCustomerProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [formData, setFormData] = React.useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    city: customer?.city || '',
    boxNumber: customer?.boxNumber || '',
    planId: customer?.planId || PLANS[0].id,
    depositAmount: customer?.depositAmount?.toString() || '',
    status: customer?.status || 'Active'
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError('');
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.boxNumber) newErrors.boxNumber = 'Box number is required';
    if (!formData.city) newErrors.city = 'City is required';

    // Box Number Uniqueness Validation
    if (formData.boxNumber) {
      const isDuplicate = existingCustomers.some((c) => 
        c.boxNumber === formData.boxNumber && 
        c.status === 'Active' && 
        c.id !== customer?.id 
      );
      if (isDuplicate) {
        newErrors.boxNumber = 'Box number is already assigned to another active customer';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Failed to save customer. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-24 md:pb-8">
        <div className="card space-y-5">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-2">
            {customer ? 'Edit Customer' : 'Basic Information'}
          </h3>

          {submitError && (
            <div className="bg-rose-50 text-rose-500 p-3 rounded-lg text-sm font-semibold border border-rose-100">
              {submitError}
            </div>
          )}
          
          <div>
            <label className="label"><User size={14} className="inline mr-1" /> Customer Name *</label>
            <input 
              type="text" 
              placeholder="Enter full name"
              className={`input-field ${errors.name ? 'border-rose-500 ring-rose-500/10' : ''}`}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label"><Phone size={14} className="inline mr-1" /> Phone Number *</label>
              <input 
                type="tel" 
                placeholder="10-digit mobile number"
                className={`input-field ${errors.phone ? 'border-rose-500 ring-rose-500/10' : ''}`}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              {errors.phone && <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">{errors.phone}</p>}
            </div>

            <div>
              <label className="label"><Building2 size={14} className="inline mr-1" /> City *</label>
              <input 
                type="text" 
                placeholder="Enter city"
                className={`input-field ${errors.city ? 'border-rose-500 ring-rose-500/10' : ''}`}
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
              {errors.city && <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">{errors.city}</p>}
            </div>
          </div>

          <div>
            <label className="label"><MapPin size={14} className="inline mr-1" /> Address</label>
            <textarea 
              placeholder="Full installation address"
              rows={3}
              className="input-field resize-none"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
        </div>

        <div className="card space-y-5">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-2">Connection Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label"><Box size={14} className="inline mr-1" /> Box Number *</label>
              <input 
                type="text" 
                placeholder="STB Serial Number"
                className={`input-field ${errors.boxNumber ? 'border-rose-500 ring-rose-500/10' : ''}`}
                value={formData.boxNumber}
                onChange={(e) => setFormData({...formData, boxNumber: e.target.value})}
              />
              {errors.boxNumber && <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">{errors.boxNumber}</p>}
            </div>

            <div>
              <label className="label"><CreditCard size={14} className="inline mr-1" /> Select Plan</label>
              <select 
                className="input-field"
                value={formData.planId}
                onChange={(e) => setFormData({...formData, planId: e.target.value})}
              >
                {PLANS.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.name} - ₹{plan.price}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label"><IndianRupee size={14} className="inline mr-1" /> Deposit Amount</label>
              <input 
                type="number" 
                placeholder="0.00"
                className="input-field"
                value={formData.depositAmount}
                onChange={(e) => setFormData({...formData, depositAmount: e.target.value})}
              />
            </div>

            <div>
              <label className="label"><Activity size={14} className="inline mr-1" /> Status</label>
              <div className="flex gap-2">
                {['Active', 'Inactive'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({...formData, status})}
                    className={`flex-1 py-3 rounded-xl border font-semibold transition-all ${
                      formData.status === status 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar for Mobile */}
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
            disabled={isSubmitting}
            className="btn-primary flex-1 md:flex-none md:w-56 py-3 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <Save size={20} />
                {customer ? 'Update Customer' : 'Save Customer'}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

