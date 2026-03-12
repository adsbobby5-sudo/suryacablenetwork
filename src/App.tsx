import React from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AddCustomer from './components/AddCustomer';
import SearchCustomer from './components/SearchCustomer';
import CustomerProfile from './components/CustomerProfile';
import AddPayment from './components/AddPayment';
import InvoiceView from './components/InvoiceView';
import Reports from './components/Reports';
import Login from './components/Login';
import { Customer, Invoice, Payment } from './types';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';

type ViewState = 
  | { type: 'dashboard' }
  | { type: 'add-customer' }
  | { type: 'edit-customer', id: string }
  | { type: 'search' }
  | { type: 'customer-profile', id: string }
  | { type: 'add-payment', invoiceId: string, customerId: string }
  | { type: 'invoice-view', invoiceId: string, customerId: string }
  | { type: 'reports' };

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);
  const [view, setView] = React.useState<ViewState>({ type: 'dashboard' });
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!isAuthenticated) return;

    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
    });

    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));
    });

    const unsubPayments = onSnapshot(collection(db, 'payments'), (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment)));
    });

    return () => {
      unsubCustomers();
      unsubInvoices();
      unsubPayments();
    };
  }, [isAuthenticated]);

  const handleSaveCustomer = async (customerData: any) => {
    if (view.type === 'edit-customer') {
      const docRef = doc(db, 'customers', view.id);
      await updateDoc(docRef, customerData);
      setView({ type: 'customer-profile', id: view.id });
    } else {
      const newCustomer = {
        ...customerData,
        createdAt: new Date().toISOString().split('T')[0],
        depositAmount: Number(customerData.depositAmount) || 0
      };
      await addDoc(collection(db, 'customers'), newCustomer);
      setView({ type: 'dashboard' });
    }
  };

  const handleRemoveCustomer = async (id: string) => {
    await deleteDoc(doc(db, 'customers', id));
    
    // In a real app we might want to also delete related invoices/payments 
    // or keep them for historical records. For now, just deleting customer.
    
    setView({ type: 'search' });
  };

  const handleSavePayment = async (paymentData: any) => {
    const newPayment = {
      ...paymentData,
      date: new Date().toISOString().split('T')[0],
      amount: Number(paymentData.amount)
    };

    await addDoc(collection(db, 'payments'), newPayment);

    // Update the invoice status and paid amount
    const invoice = invoices.find(inv => inv.id === paymentData.invoiceId);
    if (invoice) {
      const newPaidAmount = invoice.paidAmount + newPayment.amount;
      const newStatus = newPaidAmount >= invoice.amount ? 'Paid' : (newPaidAmount > 0 ? 'Partial' : 'Unpaid');
      const invoiceRef = doc(db, 'invoices', paymentData.invoiceId);
      await updateDoc(invoiceRef, {
        paidAmount: newPaidAmount,
        status: newStatus
      });
    }

    setView({ type: 'dashboard' });
  };

  const handleGenerateInvoice = async (customerId: string, amount: number) => {
    const date = new Date();
    const currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const newInvoice = {
      customerId,
      month: currentMonth,
      amount: amount,
      previousDue: 0,
      paidAmount: 0,
      status: 'Unpaid'
    };
    await addDoc(collection(db, 'invoices'), newInvoice);
  };

  const handleNavigate = (tabId: string) => {
    switch (tabId) {
      case 'dashboard': setView({ type: 'dashboard' }); break;
      case 'add-customer': setView({ type: 'add-customer' }); break;
      case 'search': setView({ type: 'search' }); break;
      case 'reports': setView({ type: 'reports' }); break;
      default: setView({ type: 'dashboard' });
    }
  };

  const getTitle = () => {
    switch (view.type) {
      case 'dashboard': return 'Dashboard';
      case 'add-customer': return 'New Customer';
      case 'edit-customer': return 'Edit Customer';
      case 'search': return 'Search Customers';
      case 'customer-profile': return 'Customer Profile';
      case 'add-payment': return 'Record Payment';
      case 'invoice-view': return 'Invoice';
      case 'reports': return 'Financial Reports';
      default: return 'Surya Cable';
    }
  };

  const getActiveTab = () => {
    if (['dashboard', 'add-customer', 'edit-customer', 'search', 'reports'].includes(view.type)) {
      return view.type;
    }
    if (view.type === 'customer-profile' || view.type === 'add-payment' || view.type === 'invoice-view') {
      return 'search';
    }
    return 'dashboard';
  };

  const onBack = () => {
    if (view.type === 'customer-profile') setView({ type: 'search' });
    else if (view.type === 'edit-customer') setView({ type: 'customer-profile', id: view.id });
    else if (view.type === 'add-payment') setView({ type: 'customer-profile', id: view.customerId });
    else if (view.type === 'invoice-view') setView({ type: 'customer-profile', id: view.customerId });
    else setView({ type: 'dashboard' });
  };

  const renderContent = () => {
    switch (view.type) {
      case 'dashboard':
        return (
          <Dashboard 
            customers={customers}
            invoices={invoices}
            payments={payments}
            onAddCustomer={() => setView({ type: 'add-customer' })} 
            onViewCustomer={(id) => setView({ type: 'customer-profile', id })}
            onViewAll={() => setView({ type: 'reports' })}
          />
        );
      case 'add-customer':
        return (
          <AddCustomer 
            existingCustomers={customers}
            onSave={handleSaveCustomer} 
            onCancel={() => setView({ type: 'dashboard' })}
          />
        );
      case 'edit-customer': {
        const customer = customers.find(c => c.id === view.id);
        return (
          <AddCustomer 
            existingCustomers={customers}
            customer={customer}
            onSave={handleSaveCustomer} 
            onCancel={() => setView({ type: 'customer-profile', id: view.id })}
          />
        );
      }
      case 'search':
        return (
          <SearchCustomer 
            customers={customers}
            invoices={invoices}
            onViewCustomer={(id) => setView({ type: 'customer-profile', id })}
          />
        );
      case 'customer-profile':
        return (
          <CustomerProfile 
            customerId={view.id}
            customers={customers}
            invoices={invoices}
            payments={payments}
            onAddPayment={(invoiceId) => setView({ type: 'add-payment', invoiceId, customerId: view.id })}
            onViewInvoice={(invoiceId) => setView({ type: 'invoice-view', invoiceId, customerId: view.id })}
            onRemove={() => handleRemoveCustomer(view.id)}
            onEdit={() => setView({ type: 'edit-customer', id: view.id })}
            onGenerateInvoice={handleGenerateInvoice}
          />
        );
      case 'add-payment':
        return (
          <AddPayment 
            invoiceId={view.invoiceId}
            customers={customers}
            invoices={invoices}
            onSave={handleSavePayment}
            onCancel={() => onBack()}
          />
        );
      case 'invoice-view':
        return (
          <InvoiceView 
            invoiceId={view.invoiceId}
            customers={customers}
            invoices={invoices}
            payments={payments}
            onBack={() => onBack()}
          />
        );
      case 'reports':
        return <Reports customers={customers} invoices={invoices} payments={payments} />;
      default:
        return <Dashboard customers={customers} invoices={invoices} payments={payments} onAddCustomer={() => {}} onViewCustomer={() => {}} onViewAll={() => setView({ type: 'reports' })} />;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <Layout 
      activeTab={getActiveTab()} 
      setActiveTab={handleNavigate} 
      title={getTitle()}
      onBack={['customer-profile', 'add-payment', 'invoice-view', 'edit-customer'].includes(view.type) ? onBack : undefined}
    >
      {renderContent()}
    </Layout>
  );
}
