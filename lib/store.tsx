'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Permissions = {
  movement_cashier: boolean;
  movement_cashierReturn: boolean;
  movement_downPayment: boolean;
  movement_downPaymentReturn: boolean;

  inventory_quantities: boolean;
  inventory_card: boolean;
  inventory_add: boolean;

  installments_addCustomer: boolean;
  installments_pay: boolean;
  installments_late: boolean;

  settings_system: boolean;
};

export type User = {
  id: string;
  name: string;
  code: string; // 2 digits
  permissions: Permissions;
};

export type Product = {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
};

export type InventoryDocument = {
  id: string;
  documentNumber: string;
  date: string;
  items: { productId: string; quantity: number }[];
};

export type PaymentMethod = 'cash' | 'visa' | 'instapay' | 'vodafone_cash';

export type InvoiceItem = {
  productId: string;
  quantity: number;
  price: number;
  total: number;
};

export type Invoice = {
  id: string;
  type: 'sale' | 'return';
  date: string;
  items: InvoiceItem[];
  total: number;
  paymentMethod: PaymentMethod;
  walletSending?: string; // Last 4 digits
  walletReceiving?: string;
  returnInvoiceId?: string; // For returns
};

export type Installment = {
  id: string;
  monthNumber: number;
  expectedDate: string;
  amount: number;
  paidAmount: number;
  status: 'paid' | 'unpaid' | 'partial';
  actualDate?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  idCardNumber?: string;
  areaType?: 'inside' | 'outside';
  guarantor1Name?: string;
  guarantor1Phone?: string;
  guarantor2Name?: string;
  guarantor2Phone?: string;
  createdAt: string;
};

export type InstallmentCustomer = {
  id: string;
  notebookPage: string;
  name: string;
  phone: string;
  address: string;
  idCardNumber?: string;
  areaType?: 'inside' | 'outside';
  deviceId: string;
  devicePrice: number;
  downPayment: number;
  downPaymentMethod?: PaymentMethod;
  visaCode?: string;
  discountPercentage?: number;
  installmentFees?: number;
  installmentPercentage?: number;
  months: number;
  monthlyAmount: number;
  installments: Installment[];
  guarantor1Name?: string;
  guarantor1Phone?: string;
  guarantor2Name?: string;
  guarantor2Phone?: string;
  isDelivered?: boolean;
  paidRemaining?: boolean;
};

type AppState = {
  products: Product[];
  invoices: Invoice[];
  installmentCustomers: InstallmentCustomer[];
  customers: Customer[];
  users: User[];
  currentUser: User | null;
  inventoryDocuments: InventoryDocument[];
};

type AppContextType = {
  state: AppState;
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  updateProductQuantity: (id: string, qtyObj: number) => void;
  addInvoice: (i: Invoice) => void;
  addInstallmentCustomer: (c: InstallmentCustomer) => void;
  updateInstallment: (customerId: string, installmentId: string, paidAmount: number, actualDate: string) => void;
  login: (code: string) => boolean;
  logout: () => void;
  addUser: (u: User) => void;
  updateUser: (u: User) => void;
  deleteUser: (id: string) => void;
  addInventoryDocument: (doc: InventoryDocument) => void;
  addCustomer: (c: Customer) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;
};

const defaultManager: User = {
  id: 'admin',
  name: 'مدير النظام',
  code: '90', // Default code config
  permissions: {
    movement_cashier: true,
    movement_cashierReturn: true,
    movement_downPayment: true,
    movement_downPaymentReturn: true,
    inventory_quantities: true,
    inventory_card: true,
    inventory_add: true,
    installments_addCustomer: true,
    installments_pay: true,
    installments_late: true,
    settings_system: true,
  }
};

const defaultState: AppState = {
  products: [
    { id: '1', code: '1001', name: 'ايفون 15 برو ماكس', category: 'موبايلات', price: 50000, quantity: 10 },
    { id: '2', code: '1002', name: 'سامسونج S24 الترا', category: 'موبايلات', price: 45000, quantity: 5 },
    { id: '3', code: '1003', name: 'شاومي 14', category: 'موبايلات', price: 20000, quantity: 15 },
  ],
  invoices: [],
  installmentCustomers: [],
  customers: [],
  users: [defaultManager],
  currentUser: null,
  inventoryDocuments: [],
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('phone_sys_state');
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        setState({ 
          ...defaultState, 
          ...parsedState, 
          products: parsedState.products || defaultState.products,
          invoices: parsedState.invoices || defaultState.invoices,
          installmentCustomers: parsedState.installmentCustomers || defaultState.installmentCustomers,
          customers: parsedState.customers || [],
          users: parsedState.users || defaultState.users,
          inventoryDocuments: parsedState.inventoryDocuments || defaultState.inventoryDocuments,
          currentUser: null
        });
      } catch (e) {
        console.error('Failed to load state', e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('phone_sys_state', JSON.stringify(state));
  }, [state]);

  const addProduct = (p: Product) => {
    setState((s) => ({ ...s, products: [...s.products, p] }));
  };

  const updateProduct = (p: Product) => {
    setState((s) => ({ ...s, products: s.products.map(existing => existing.id === p.id ? p : existing) }));
  };

  const updateProductQuantity = (id: string, diff: number) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity + diff } : p
      ),
    }));
  };

  const addInventoryDocument = (doc: InventoryDocument) => {
    setState(s => ({ ...s, inventoryDocuments: [...s.inventoryDocuments, doc] }));
    doc.items.forEach(item => {
      updateProductQuantity(item.productId, item.quantity);
    });
  };

  const addInvoice = (i: Invoice) => {
    setState((s) => ({ ...s, invoices: [...s.invoices, i] }));
    // Update inventory
    i.items.forEach(item => {
      updateProductQuantity(item.productId, i.type === 'sale' ? -item.quantity : item.quantity);
    });
  };

  const addInstallmentCustomer = (c: InstallmentCustomer) => {
    setState((s) => ({ ...s, installmentCustomers: [...s.installmentCustomers, c] }));
    // Also deduct product from inventory
    updateProductQuantity(c.deviceId, -1);
  };

  const updateInstallment = (customerId: string, installmentId: string, paidAmount: number, actualDate: string) => {
    setState((s) => ({
      ...s,
      installmentCustomers: s.installmentCustomers.map((cust) => {
        if (cust.id === customerId) {
          return {
            ...cust,
            installments: cust.installments.map((inst) => 
              inst.id === installmentId 
                ? { ...inst, status: paidAmount >= inst.amount ? 'paid' : 'partial', paidAmount, actualDate } 
                : inst
            )
          };
        }
        return cust;
      })
    }));
  };

  const login = (code: string) => {
    const user = state.users?.find(u => u.code === code);
    if (user) {
      setState(s => ({ ...s, currentUser: user }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(s => ({ ...s, currentUser: null }));
  };

  const addUser = (u: User) => {
    setState(s => ({ ...s, users: [...s.users, u] }));
  };

  const updateUser = (u: User) => {
    setState(s => ({ ...s, users: s.users.map(existing => existing.id === u.id ? u : existing), currentUser: s.currentUser?.id === u.id ? u : s.currentUser }));
  };

  const deleteUser = (id: string) => {
    setState(s => ({ ...s, users: s.users.filter(existing => existing.id !== id) }));
  };

  const addCustomer = (c: Customer) => {
    setState(s => ({ ...s, customers: [...s.customers, c] }));
  };

  const updateCustomer = (c: Customer) => {
    setState(s => ({ ...s, customers: s.customers.map(x => x.id === c.id ? c : x) }));
  };

  const deleteCustomer = (id: string) => {
    setState(s => ({ ...s, customers: s.customers.filter(x => x.id !== id) }));
  };

  return (
    <AppContext.Provider value={{ state, addProduct, updateProduct, updateProductQuantity, addInvoice, addInstallmentCustomer, updateInstallment, login, logout, addUser, updateUser, deleteUser, addInventoryDocument, addCustomer, updateCustomer, deleteCustomer }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
