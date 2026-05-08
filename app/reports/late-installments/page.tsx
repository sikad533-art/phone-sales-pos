"use client";

import Layout from '@/components/Layout';
import { useState } from 'react';
import { useAppContext } from '@/lib/store';
import { Search, AlertCircle, FileText, Calendar, DollarSign, User } from 'lucide-react';

export default function LateInstallmentsReport() {
  const { state } = useAppContext();
  
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!fromDate || !toDate) {
      alert("برجاء تحديد تاريخ البداية والنهاية");
      return;
    }

    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    const lateData = state.installmentCustomers.map(customer => {
      // Find all unpaid or partially paid installments in the date range
      const lateInstallments = customer.installments.filter(inst => {
        if (inst.status === 'paid') return false;
        
        const instDate = new Date(inst.expectedDate);
        return instDate >= start && instDate <= end;
      });

      if (lateInstallments.length > 0) {
        const lateAmount = lateInstallments.reduce((sum, inst) => sum + (inst.amount - inst.paidAmount), 0);
        return {
          customer,
          lateCount: lateInstallments.length,
          lateAmount
        };
      }
      return null;
    }).filter(item => item !== null);

    setResults(lateData);
    setHasSearched(true);
  };

  const totalLateAmount = results.reduce((sum, item) => sum + item.lateAmount, 0);

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full max-w-6xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-red-50 flex justify-between items-center text-red-900">
          <h2 className="font-bold text-xl flex items-center gap-2">
            <AlertCircle size={24} />
            تقرير الأقساط المتأخرة
          </h2>
        </div>

        {/* Search Form */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
              <div className="relative">
                <input 
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-red-500 focus:border-red-500 bg-gray-50 text-right"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
              <div className="relative">
                <input 
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-red-500 focus:border-red-500 bg-gray-50 text-right"
                />
              </div>
            </div>
            <div>
              <button 
                onClick={handleSearch}
                className="bg-red-600 text-white hover:bg-red-700 p-2.5 px-8 rounded-lg font-bold flex justify-center items-center gap-2 transition-colors shadow-sm"
              >
                <Search size={20} /> بحث
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          {!hasSearched ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Calendar size={64} className="mb-4 opacity-30 text-red-500" />
              <p className="text-lg">حدد الفترة الزمنية واضغط على بحث لعرض الأقساط المتأخرة</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-green-500">
              <AlertCircle size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-bold">لا يوجد أقساط متأخرة في هذه الفترة</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-bold text-gray-700">نتائج البحث ({results.length} عميل)</h3>
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg border border-red-200 font-bold flex items-center gap-2">
                  <DollarSign size={20}/>
                  إجمالي المبالغ المتأخرة: {totalLateAmount.toLocaleString()} ج.م
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-200">
                      <th className="p-4 font-semibold w-24">رقم الصفحة</th>
                      <th className="p-4 font-semibold">اسم العميل</th>
                      <th className="p-4 font-semibold">رقم التليفون</th>
                      <th className="p-4 font-semibold text-center w-32">عدد الأقساط</th>
                      <th className="p-4 font-semibold text-left w-40">إجمالي المبلغ المستحق</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item, index) => (
                      <tr key={item.customer.id} className="border-b last:border-0 hover:bg-red-50/50 transition-colors">
                        <td className="p-4 font-bold text-gray-800">
                          {item.customer.notebookPage || '-'}
                        </td>
                        <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          {item.customer.name}
                        </td>
                        <td className="p-4 text-gray-600 font-medium">
                          {item.customer.phone}
                        </td>
                        <td className="p-4 text-center font-bold text-red-600">
                          {item.lateCount}
                        </td>
                        <td className="p-4 text-left font-bold text-red-700">
                          {item.lateAmount.toLocaleString()} ج.م
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
