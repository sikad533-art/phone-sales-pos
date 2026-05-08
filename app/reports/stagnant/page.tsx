"use client";

import Layout from '@/components/Layout';
import { useAppContext } from '@/lib/store';
import { useState, useMemo } from 'react';
import { PackageX, AlertTriangle, CalendarDays } from 'lucide-react';

export default function StagnantReport() {
  const { state } = useAppContext();
  const [daysThreshold, setDaysThreshold] = useState(30);
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = Array.from(new Set(state.products.map(p => p.category).filter(Boolean)));

  const stagnantItems = useMemo(() => {
    const today = new Date();
    // Calculate last date of sale for each product
    const lastSaleDates: Record<string, Date> = {};
    const lastEntryDates: Record<string, Date> = {};

    // Get last sale date
    state.invoices.filter(i => i.type === 'sale').forEach(inv => {
      const invDate = new Date(inv.date);
      inv.items.forEach(item => {
        if (!lastSaleDates[item.productId] || invDate > lastSaleDates[item.productId]) {
          lastSaleDates[item.productId] = invDate;
        }
      });
    });

    // Get last inventory entry date
    state.inventoryDocuments?.forEach(doc => {
      const docDate = new Date(doc.date);
      doc.items.forEach(item => {
        if (!lastEntryDates[item.productId] || docDate > lastEntryDates[item.productId]) {
          lastEntryDates[item.productId] = docDate;
        }
      });
    });

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    const items = state.products.filter(p => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (p.quantity <= 0) return false; // Not stagnant if not in stock

      const lastSaleDate = lastSaleDates[p.id];
      const entryDate = lastEntryDates[p.id];

      // If never sold, but entered long ago
      if (!lastSaleDate) {
        return !entryDate || entryDate < thresholdDate;
      }

      // If sold, check if last sale was before threshold
      return lastSaleDate < thresholdDate;
    }).map(p => ({
      ...p,
      lastSaleDate: lastSaleDates[p.id] ? lastSaleDates[p.id].toISOString().split('T')[0] : 'لم يباع أبداً',
      lastEntryDate: lastEntryDates[p.id] ? lastEntryDates[p.id].toISOString().split('T')[0] : 'رصيد افتتاحي/غير محدد',
    }));

    // Sort by largest quantity and oldest sale
    return items.sort((a, b) => b.quantity - a.quantity);
  }, [state.products, state.invoices, state.inventoryDocuments, daysThreshold, categoryFilter]);

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 flex-wrap gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-900">
            <PackageX />
            تقرير الرواكد (الأصناف البطيئة)
          </h2>
        </div>

        <div className="p-6 border-b border-gray-100 bg-white flex flex-wrap gap-6 items-end">
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">عدد أيام الركود (لم يباع منذ)</label>
            <div className="flex gap-2">
              {[30, 60, 90, 180].map(days => (
                <button
                  key={days}
                  onClick={() => setDaysThreshold(days)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 ${daysThreshold === days ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-800 hover:bg-orange-200'}`}
                >
                  {days} يوم
                </button>
              ))}
            </div>
          </div>
          <div className="w-64">
             <label className="block text-sm font-medium text-gray-700 mb-2">تصفية بالمجموعة</label>
             <select className="w-full border p-2 rounded-lg border-gray-300" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
               <option value="">كل المجموعات</option>
               {categories.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-auto bg-gray-50">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm">
                  <th className="p-4 border-b border-gray-200">الصنف</th>
                  <th className="p-4 border-b border-gray-200">المجموعة</th>
                  <th className="p-4 border-b border-gray-200 text-center">الرصيد المتبقي</th>
                  <th className="p-4 border-b border-gray-200">آخر إذن إضافة</th>
                  <th className="p-4 border-b border-gray-200">تاريخ آخر بيع</th>
                  <th className="p-4 border-b border-gray-200 text-left">التنبيه</th>
                </tr>
              </thead>
              <tbody>
                {stagnantItems.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-orange-50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">{item.name} <span className="text-xs text-gray-400 block font-normal">{item.code}</span></td>
                    <td className="p-4 text-sm text-gray-600">{item.category || 'غير محدد'}</td>
                    <td className="p-4 text-center">
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold">{item.quantity}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 flex items-center gap-2">
                       <CalendarDays size={14} className="text-gray-400" />
                       {item.lastEntryDate}
                    </td>
                    <td className="p-4 text-sm font-medium text-orange-600 flex items-center gap-2">
                       <CalendarDays size={14} className="text-orange-400" />
                       {item.lastSaleDate}
                    </td>
                    <td className="p-4 text-left">
                      <span className="flex items-center gap-1 text-red-600 text-sm font-bold justify-end">
                         <AlertTriangle size={16} /> راكد
                      </span>
                    </td>
                  </tr>
                ))}
                {stagnantItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">لا توجد أصناف راكدة مطابقة للاختيارات الحالية</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
