"use client";

import Layout from '@/components/Layout';
import { useAppContext, Product } from '@/lib/store';
import { FileDigit, PackageSearch } from 'lucide-react';
import { useState } from 'react';

export default function ItemCard() {
  const { state } = useAppContext();
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const selectedProduct = state.products.find(p => p.id === selectedProductId);

  // Get all invoice items that match this product
  const productMovements = state.invoices.flatMap(inv => 
    inv.items
       .filter(item => item.productId === selectedProductId)
       .map(item => ({
         date: inv.date,
         invoiceId: inv.id,
         type: inv.type,
         quantity: item.quantity,
         price: item.price,
       }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 flex flex-col h-full">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-900 mb-2">
          <FileDigit size={28} />
          كارت الصنف
        </h2>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">اختر الصنف لعرض حركته</label>
            <select 
              value={selectedProductId} 
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- اختر الصنف --</option>
              {state.products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (الكود: {p.code})</option>
              ))}
            </select>
          </div>
          {selectedProduct && (
             <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 px-6 flex flex-col items-center">
               <span className="text-xs text-indigo-600 font-bold mb-1">الرصيد الحالي بالمخزن</span>
               <span className="text-2xl font-bold text-indigo-900">{selectedProduct.quantity}</span>
             </div>
          )}
        </div>

        {selectedProductId ? (
          <div className="bg-white flex-1 rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
              حركة المبيعات والمرتجعات للمنتج: {selectedProduct?.name}
            </div>
            <div className="flex-1 overflow-auto p-0">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-600">
                    <th className="p-4 border-b">الوقت والتاريخ</th>
                    <th className="p-4 border-b">رقم الفاتورة</th>
                    <th className="p-4 border-b">نوع الحركة</th>
                    <th className="p-4 border-b">كمية (منصرف)</th>
                    <th className="p-4 border-b">كمية (وارد)</th>
                    <th className="p-4 border-b">السعر</th>
                  </tr>
                </thead>
                <tbody>
                  {productMovements.map((move, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-gray-500">{new Date(move.date).toLocaleString('ar-EG')}</td>
                      <td className="p-4 font-mono">{move.invoiceId}</td>
                      <td className="p-4 font-medium">
                        {move.type === 'sale' ? <span className="text-green-600">مبيعات كاشير</span> : <span className="text-red-600">مرتجع مبيعات</span>}
                      </td>
                      <td className="p-4 font-bold text-red-600">{move.type === 'sale' ? move.quantity : '-'}</td>
                      <td className="p-4 font-bold text-green-600">{move.type === 'return' ? move.quantity : '-'}</td>
                      <td className="p-4">{move.price.toLocaleString()} ج</td>
                    </tr>
                  ))}
                  
                  {productMovements.length === 0 && (
                    <tr><td colSpan={6} className="p-12 text-center text-gray-500">
                      <PackageSearch className="mx-auto text-gray-300 mb-3" size={48} />
                      لا توجد حركات مسجلة لهذا الصنف
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            يرجى اختيار صنف لعرض بيانات كارت الصنف
          </div>
        )}
      </div>
    </Layout>
  );
}
