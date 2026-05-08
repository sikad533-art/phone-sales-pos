"use client";

import Layout from '@/components/Layout';
import { useAppContext } from '@/lib/store';
import { FileLock2, Info } from 'lucide-react';
import { useMemo } from 'react';

export default function ShiftClosing() {
  const { state } = useAppContext();

  // For a real app, this would filter by "today" or "current shift". 
  // Let's filter by today's date
  const today = new Date().toISOString().split('T')[0];

  const todaysInvoices = useMemo(() => {
    return state.invoices.filter(inv => inv.date.startsWith(today));
  }, [state.invoices, today]);

  const cashSales = todaysInvoices.filter(i => i.type === 'sale' && i.paymentMethod === 'cash').reduce((a, b) => a + b.total, 0);
  const cashReturns = todaysInvoices.filter(i => i.type === 'return' && i.paymentMethod === 'cash').reduce((a, b) => a + b.total, 0);
  
  const digitalSales = todaysInvoices.filter(i => i.type === 'sale' && i.paymentMethod !== 'cash').reduce((a, b) => a + b.total, 0);
  const digitalReturns = todaysInvoices.filter(i => i.type === 'return' && i.paymentMethod !== 'cash').reduce((a, b) => a + b.total, 0);

  const todaysInstallments = state.installmentCustomers.reduce((acc, cust) => {
    return acc + cust.installments.filter(i => i.actualDate === today).reduce((sum, inst) => sum + inst.paidAmount, 0);
  }, 0);

  const netCash = cashSales + todaysInstallments - cashReturns;
  const netDigital = digitalSales - digitalReturns;
  const totalShift = netCash + netDigital;

  const handleCloseShift = () => {
    if (confirm("هل أنت متأكد من تقفيل وتصفير وردية اليوم؟ سيتم ترحيل الأرصدة وبدء وردية جديدة.")) {
       // In a real app we would clear "current shift" data or mark it as archived
       alert("تم تقفيل الوردية بنجاح.");
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 flex flex-col pt-10">
        <div className="text-center space-y-2">
          <FileLock2 size={48} className="mx-auto text-indigo-600 mb-2" />
          <h2 className="text-3xl font-bold text-gray-900">تقفيل الوردية (يومية المبيعات)</h2>
          <p className="text-gray-500">تاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-lg text-gray-800">ملخص إيرادات اليوم</h3>
            <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">الوردية الحالية</span>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 divide-x divide-x-reverse divide-gray-100">
             <div className="space-y-4">
                <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-4 border-b pb-2">النقدية</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">مبيعات كاشير:</span>
                  <span className="font-semibold">{cashSales.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">تحصيل أقساط (عربون):</span>
                  <span className="font-semibold">{todaysInstallments.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm text-red-500">
                  <span>مرتجعات نقدية:</span>
                  <span className="font-semibold">- {cashReturns.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100 font-bold text-lg text-green-700">
                  <span>صافي الخزينة:</span>
                  <span>{netCash.toLocaleString()} ج.م</span>
                </div>
             </div>

             <div className="space-y-4 pr-8">
                <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-4 border-b pb-2">إلكتروني (فيزا / محافظ)</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">إجمالي الوارد:</span>
                  <span className="font-semibold">{digitalSales.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm text-red-500">
                  <span>إجمالي المرتجع:</span>
                  <span className="font-semibold">- {digitalReturns.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100 font-bold text-lg text-blue-700">
                  <span>صافي الإلكتروني:</span>
                  <span>{netDigital.toLocaleString()} ج.م</span>
                </div>
             </div>
          </div>

          <div className="bg-indigo-900 text-white p-6 flex justify-between items-center">
             <div className="text-indigo-200">إجمالي إيراد الوردية بالكامل (الدرج + الإلكتروني)</div>
             <div className="text-3xl font-bold">{totalShift.toLocaleString()} ج.م</div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button onClick={handleCloseShift} className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition flex items-center gap-2 shadow-sm">
            <FileLock2 size={24}/>
            إعتماد وتقفيل الوردية
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex gap-3 text-sm">
          <Info className="shrink-0" size={20} />
          <p>
            تنويه: تقفيل الوردية سيقوم بتسجيل جميع هذه الأرصدة كوردية مغلقة، وسيبدأ النظام بحساب إيرادات اليوم من جديد أو في يوم العمل القادم.
          </p>
        </div>
      </div>
    </Layout>
  );
}
