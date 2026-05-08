"use client";

import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/lib/store';
import { Search, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function Payments() {
  const { state, updateInstallment } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof state.installmentCustomers[0] | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const handleSearch = () => {
    if (!searchQuery) return;
    const found = state.installmentCustomers.find(c =>
      c.name.includes(searchQuery) || c.phone.includes(searchQuery) || c.notebookPage === searchQuery || c.idCardNumber === searchQuery
    );
    setSelectedCustomer(found || null);
    if (!found) alert('لم يتم العثور على عميل');
  };

  const handlePayInstallment = (installmentId: string, amount: number) => {
    if (!selectedCustomer) return;
    const actualDate = new Date().toISOString().split('T')[0];
    updateInstallment(selectedCustomer.id, installmentId, amount, actualDate);
    setSelectedCustomer(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        installments: prev.installments.map(inst =>
          inst.id === installmentId ? { ...inst, status: 'paid', paidAmount: amount, actualDate } : inst
        )
      };
    });
  };

  const toggleRow = (id: string) => setExpandedRows(p => ({ ...p, [id]: !p[id] }));

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
          <Search size={24} /> السداد - بحث عن عميل
        </h2>

        <div className="flex gap-4 items-end mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">بحث برقم الصفحة، الهاتف، أو الاسم</label>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="أدخل عبارة البحث..."
              className="w-full border-gray-300 rounded-lg p-3 border focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <button onClick={handleSearch}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
            <Search size={20} /> بحث
          </button>
        </div>

        {selectedCustomer && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700 w-28">اسم العميل</span>
                  <span className="font-medium text-gray-900">{selectedCustomer.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700 w-28">رقم التليفون</span>
                  <span className="text-gray-900">{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700 w-28">اسم الجهاز</span>
                  <span className="text-gray-900">{state.products.find(p => p.id === selectedCustomer.deviceId)?.name || 'غير معروف'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700 w-28">الباقي</span>
                  <span className="font-bold text-lg text-indigo-700">{(selectedCustomer.monthlyAmount * selectedCustomer.months - selectedCustomer.installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.paidAmount, 0)).toFixed(2)} ج</span>
                </div>
              </div>
            </div>

            {selectedCustomer.paidRemaining ? (
              <div className="p-8 text-center text-green-700 bg-green-50 m-6 rounded-xl border border-green-200">
                <Check size={48} className="mx-auto mb-2" />
                <h4 className="text-xl font-bold">تم سداد سعر الجهاز بالكامل</h4>
              </div>
            ) : (
              <div className="p-6">
                <div className="hidden md:block">
                  <table className="w-full text-right border-collapse border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-indigo-50 text-indigo-900">
                        <th className="p-4 font-bold border-l border-indigo-100">رقم القسط</th>
                        <th className="p-4 font-bold border-l border-indigo-100">تاريخ الدفعات</th>
                        <th className="p-4 font-bold border-l border-indigo-100">مبلغ الدفع</th>
                        <th className="p-4 font-bold border-l border-indigo-100">تاريخ الدفع</th>
                        <th className="p-4 font-bold w-32">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer.installments.map(inst => {
                        const isPaid = inst.status === 'paid';
                        return (
                          <tr key={inst.id} className={`border-b border-gray-100 ${isPaid ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}>
                            <td className="p-4 font-bold text-indigo-900">{inst.monthNumber}</td>
                            <td className="p-4 font-medium">{inst.expectedDate}</td>
                            <td className="p-4 text-indigo-700 font-bold">{isPaid ? inst.paidAmount.toFixed(2) : inst.amount.toFixed(2)} ج</td>
                            <td className="p-4 text-gray-600">{inst.actualDate || '-'}</td>
                            <td className="p-4">
                              {isPaid ? (
                                <span className="flex items-center gap-1 text-green-700 font-bold bg-green-100 py-1.5 px-3 rounded text-center"><Check size={16} /> مسدد</span>
                              ) : (
                                <button onClick={() => handlePayInstallment(inst.id, inst.amount)}
                                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 font-bold transition-colors">دفع القسط</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-3">
                  {selectedCustomer.installments.map(inst => {
                    const isPaid = inst.status === 'paid';
                    return (
                      <div key={inst.id} className={`border border-gray-200 rounded-lg overflow-hidden ${isPaid ? 'bg-green-50' : ''}`}>
                        <button onClick={() => toggleRow(inst.id)} className="w-full flex items-center justify-between p-4 text-right">
                          <span className="font-bold text-indigo-900">القسط {inst.monthNumber}</span>
                          {isPaid ? <span className="text-green-700 font-bold">✅ مسدد</span> : <span className="text-indigo-600 font-bold">{inst.amount.toFixed(2)} ج</span>}
                          {expandedRows[inst.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {expandedRows[inst.id] && (
                          <div className="px-4 pb-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">تاريخ الدفعات:</span><span>{inst.expectedDate}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">تاريخ الدفع:</span><span>{inst.actualDate || '-'}</span></div>
                            {!isPaid && (
                              <button onClick={() => handlePayInstallment(inst.id, inst.amount)}
                                className="w-full mt-2 bg-indigo-600 text-white py-3 rounded-lg font-bold">💳 دفع القسط</button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
