"use client";

import Layout from '@/components/Layout';
import { useAppContext } from '@/lib/store';
import { ArrowDownRight, ArrowUpRight, CreditCard, Wallet } from 'lucide-react';
import { useMemo } from 'react';

export default function VisaReport() {
  const { state } = useAppContext();

  // Filter only non-cash invoices
  const electronicInvoices = useMemo(() => {
    return state.invoices.filter(inv => inv.paymentMethod !== 'cash');
  }, [state.invoices]);

  const totalSales = electronicInvoices.filter(i => i.type === 'sale').reduce((acc, curr) => acc + curr.total, 0);
  const totalReturns = electronicInvoices.filter(i => i.type === 'return').reduce((acc, curr) => acc + curr.total, 0);
  
  const netDigital = totalSales - totalReturns;

  const getPaymentMethodName = (method: string) => {
    switch(method) {
      case 'visa': return 'فيزا';
      case 'instapay': return 'إنستاباي';
      case 'vodafone_cash': return 'فودافون كاش';
      default: return method;
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 flex flex-col h-full">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-900 mb-2">
          <CreditCard size={28} />
          كشف حساب فيزا والمحافظ
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">إجمالي الوارد (إلكتروني)</div>
            <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <ArrowUpRight size={20}/> {totalSales.toLocaleString()} ج.م
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">المرتجعات (إلكتروني)</div>
            <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <ArrowDownRight size={20}/> {totalReturns.toLocaleString()} ج.م
            </div>
          </div>
          <div className="bg-indigo-600 p-6 rounded-xl border border-indigo-700 shadow-md text-white">
            <div className="text-sm text-indigo-100 mb-1">الصافي</div>
            <div className="text-3xl font-bold">
              {netDigital.toLocaleString()} ج.م
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white flex-1 rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
            حركة الدفع الإلكتروني والمحافظ
          </div>
          <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs uppercase pt-2">
                  <th className="p-4 border-b">الوقت والتاريخ</th>
                  <th className="p-4 border-b">طريقة الدفع</th>
                  <th className="p-4 border-b">نوع الحركة</th>
                  <th className="p-4 border-b">رقم الفاتورة</th>
                  <th className="p-4 border-b">المحفظة المُستلمة</th>
                  <th className="p-4 border-b">المحفظة المُرسلة</th>
                  <th className="p-4 border-b">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {electronicInvoices.map(inv => (
                  <tr key={inv.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-500">{new Date(inv.date).toLocaleString('ar-EG')}</td>
                    <td className="p-4 font-medium">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                         {getPaymentMethodName(inv.paymentMethod)}
                      </span>
                    </td>
                    <td className="p-4 font-medium">
                      {inv.type === 'sale' ? <span className="text-green-600">عملية سداد</span> : <span className="text-red-600">مرتجع</span>}
                    </td>
                    <td className="p-4">{inv.id}</td>
                    <td className="p-4 font-mono text-gray-500">{inv.walletReceiving || '-'}</td>
                    <td className="p-4 font-mono text-gray-500">{inv.walletSending || '-'}</td>
                    <td className={`p-4 font-bold ${inv.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
                      {inv.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
                
                {electronicInvoices.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-500">لا توجد حركات إلكترونية مسجلة</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
