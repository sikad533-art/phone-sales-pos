"use client";

import Layout from '@/components/Layout';
import { useAppContext } from '@/lib/store';
import { ArrowDownRight, ArrowUpRight, Banknote } from 'lucide-react';
import { useMemo } from 'react';

export default function CashReport() {
  const { state } = useAppContext();

  // Filter only cash invoices
  const cashInvoices = useMemo(() => {
    return state.invoices.filter(inv => inv.paymentMethod === 'cash');
  }, [state.invoices]);

  const totalSales = cashInvoices.filter(i => i.type === 'sale').reduce((acc, curr) => acc + curr.total, 0);
  const totalReturns = cashInvoices.filter(i => i.type === 'return').reduce((acc, curr) => acc + curr.total, 0);
  
  // Installment payments (they are inherently cash usually, assuming all paid installments are cash for simplicity unless changed)
  const totalInstallments = state.installmentCustomers.reduce((acc, cust) => {
    return acc + cust.installments.filter(i => i.status === 'paid' || i.paidAmount > 0).reduce((sum, inst) => sum + inst.paidAmount, 0);
  }, 0);

  const netCash = totalSales + totalInstallments - totalReturns;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 flex flex-col h-full">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-900 mb-2">
          <Banknote size={28} />
          كشف حساب نقدي
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">إجمالي المبيعات النقدية</div>
            <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <ArrowUpRight size={20}/> {totalSales.toLocaleString()} ج.م
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">تحصيل أقساط</div>
            <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
              <ArrowUpRight size={20}/> {totalInstallments.toLocaleString()} ج.م
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">المرتجعات النقدية</div>
            <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <ArrowDownRight size={20}/> {totalReturns.toLocaleString()} ج.م
            </div>
          </div>
          <div className="bg-indigo-600 p-6 rounded-xl border border-indigo-700 shadow-md text-white">
            <div className="text-sm text-indigo-100 mb-1">صافي الخزينة</div>
            <div className="text-3xl font-bold">
              {netCash.toLocaleString()} ج.م
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white flex-1 rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
            حركة النقدية
          </div>
          <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600">
                  <th className="p-4 border-b">الوقت والتاريخ</th>
                  <th className="p-4 border-b">نوع الحركة</th>
                  <th className="p-4 border-b">رقم الفاتورة/المرجع</th>
                  <th className="p-4 border-b">دائن (وارد)</th>
                  <th className="p-4 border-b">مدين (منصرف)</th>
                </tr>
              </thead>
              <tbody>
                {/* Sales & Returns */}
                {cashInvoices.map(inv => (
                  <tr key={inv.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-500">{new Date(inv.date).toLocaleString('ar-EG')}</td>
                    <td className="p-4 font-medium">
                      {inv.type === 'sale' ? <span className="text-green-600">مبيعات كاشير</span> : <span className="text-red-600">مرتجع مبيعات</span>}
                    </td>
                    <td className="p-4">{inv.id}</td>
                    <td className="p-4 font-bold text-green-600">{inv.type === 'sale' ? inv.total.toLocaleString() : '-'}</td>
                    <td className="p-4 font-bold text-red-600">{inv.type === 'return' ? inv.total.toLocaleString() : '-'}</td>
                  </tr>
                ))}
                
                {/* Installments handling - simplistic list */}
                {state.installmentCustomers.map(cust => 
                  cust.installments.map(inst => {
                    if (inst.paidAmount > 0) {
                      return (
                        <tr key={inst.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 text-gray-500">{inst.actualDate ? new Date(inst.actualDate).toLocaleString('ar-EG') : '-'}</td>
                          <td className="p-4 font-medium text-emerald-600">تحصيل قسط ({cust.name})</td>
                          <td className="p-4">قسط شهر {inst.monthNumber}</td>
                          <td className="p-4 font-bold text-green-600">{inst.paidAmount.toLocaleString()}</td>
                          <td className="p-4 font-bold text-red-600">-</td>
                        </tr>
                      )
                    }
                    return null;
                  })
                )}
                
                {cashInvoices.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">لا توجد حركات نقدية مسجلة</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
