export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';
export type CustomerStatus = 'Active' | 'Inactive';
export type PaymentMode = 'Cash' | 'UPI' | 'Bank';

export interface Plan {
  id: string;
  name: string;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  boxNumber: string;
  planId: string;
  depositAmount: number;
  status: CustomerStatus;
  createdAt: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  month: string; // e.g., "2024-03"
  amount: number;
  previousDue: number;
  paidAmount: number;
  status: PaymentStatus;
}

export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  remarks?: string;
}

export const PLANS: Plan[] = [
  { id: 'p1', name: 'Basic Plan', price: 300 },
  { id: 'p2', name: 'Standard Plan', price: 450 },
  { id: 'p3', name: 'Data Plan', price: 350 },
  { id: 'p4', name: 'Premium Plan', price: 600 },
];
