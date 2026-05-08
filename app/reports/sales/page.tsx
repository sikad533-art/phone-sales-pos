"use client";

import Layout from '@/components/Layout';
import { useAppContext, Invoice } from '@/lib/store';
import { useState, useMemo } from 'react';
import { FileText, Search, TrendingUp, Calendar } from 'lucide-react';

export default function SalesReport() {
  const { state } = useAppContext();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const reportData = useMemo(() => {
    // Filter invoices by date and sale type
    const salesInvoices = state.invoices.filter(inv => {
      if (inv.type !== 'sale') return false;
      const invDate = inv.date.split('T')[0];
      if (dateFrom && invDate < dateFrom) return false;
      if (dateTo && invDate > dateTo) return false;
      return true;
    });

    // Aggregate by category and item
    const categories: Record<string, { totalQty: number, totalAmount: number, items: Record<string, {name: string, qty: number, total: number}> }> = {};
    let totalSales = 0;

    salesInvoices.forEach(inv => {
      inv.items.forEach(item => {
        const product = state.products.find(p => p.id === item.productId);
        if (!product) return;
        const catName = product.category || 'بدون مجموعة';
        
        if (!categories[catName]) {
          categories[catName] = { totalQty: 0, totalAmount: 0, items: {} };
        }
        
        if (!categories[catName].items[product.id]) {
          categories[catName].items[product.id] = { name: product.name, qty: 0, total: 0 };
        }
        
        categories[catName].items[product.id].qty += item.quantity;
        const itemTotal = item.quantity * item.price;
        categories[catName].items[product.id].total += itemTotal;
        categories[catName].totalQty += item.quantity;
        categories[catName].totalAmount += itemTotal;
        totalSales += itemTotal;
      });
    });

    return { categories, totalSales };
  }, [state.invoices, state.products, dateFrom, dateTo]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return reportData.categories;
    const result: typeof reportData.categories = {};
    Object.entries(reportData.categories).forEach(([cat, data]) => {
      if (cat.includes(searchTerm)) {
        result[cat] = data;
        return;
      }
      const matchingItems = Object.entries(data.items).filter(([_, item]) => item.name.includes(searchTerm));
      if (matchingItems.length > 0) {
        result[cat] = { ...data, items: Object.fromEntries(matchingItems) };
      }
    });
    return result;
  }, [reportData.categories, searchTerm]);

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 flex-wrap gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-900">
            <TrendingUp />
            تقرير المبيعات (حسب الصنف والمجموعة)
          </h2>
        </div>

        <div className="p-6 border-b border-gray-100 bg-white grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">من تاريخ</label>
            <input type="date" className="w-full border p-2 rounded-lg" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">إلى تاريخ</label>
            <input type="date" className="w-full border p-2 rounded-lg" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">بحث بصنف / مجموعة</label>
            <input type="text" className="w-full border p-2 rounded-lg" placeholder="ابحث..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="p-6 flex-1 overflow-auto bg-gray-50">
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl max-w-sm">
            <h3 className="text-indigo-800 font-semibold mb-1">إجمالي المبيعات للفترة</h3>
            <div className="text-3xl font-bold text-indigo-900">{reportData.totalSales.toLocaleString()} ج.م</div>
          </div>

          <div className="space-y-6">
            {Object.entries(filteredCategories).length === 0 ? (
               <div className="text-center p-8 text-gray-500 bg-white rounded-xl border border-gray-200">
                 لا توجد مبيعات في هذه الفترة
               </div>
            ) : Object.entries(filteredCategories).map(([catName, data]) => (
              <div key={catName} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-indigo-900 text-white p-4 flex justify-between items-center">
                  <h3 className="font-bold text-lg">{catName}</h3>
                  <div className="text-indigo-100 bg-indigo-800 px-3 py-1 rounded-lg text-sm font-medium">
                    إجمالي المجموعة: {data.totalAmount.toLocaleString()} ج.م ({data.totalQty} قطعة)
                  </div>
                </div>
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm">
                      <th className="p-3 border-b border-gray-200">الصنف</th>
                      <th className="p-3 border-b border-gray-200 w-32 text-center">الكمية المباعة</th>
                      <th className="p-3 border-b border-gray-200 w-48 text-left">قيمة المبيعات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.items).map(([itemId, item]) => (
                      <tr key={itemId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-semibold text-gray-800">{item.name}</td>
                        <td className="p-3 text-center font-medium text-emerald-600">{item.qty}</td>
                        <td className="p-3 text-left font-bold text-indigo-600">{item.total.toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
