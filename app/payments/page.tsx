"use client";

import Layout from '@/components/Layout';
import { useState } from 'react';
import { useAppContext, InstallmentCustomer } from '@/lib/store';
import { Search, Minus, Check, Receipt } from 'lucide-react';

export default function Payments() {
  const { state, updateInstallment } = useAppContext();
  const [customerNumber, setCustomerNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedContract, setSelectedContract] = useState<InstallmentCustomer | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleSearch = () => {
    if (!customerNumber.trim()) return;
    const found = state.installmentCustomers.find(c =>
      c.notebookPage === customerNumber || c.phone.includes(customerNumber) || c.name.includes(customerNumber) || c.idCardNumber === customerNumber
    );
    setSelectedContract(found || null);
    if (!found) alert('لم يتم العثور على عقد');
  };

  const handlePayInstallment = (installmentId: string, amount: number) => {
    if (!selectedContract) return;
    const actualDate = paymentDate || new Date().toISOString().split('T')[0];
    updateInstallment(selectedContract.id, installmentId, amount, actualDate);
    setSelectedContract(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        installments: prev.installments.map(inst =>
          inst.id === installmentId ? { ...inst, status: 'paid', paidAmount: amount, actualDate } : inst
        )
      };
    });
  };

  const clearCustomerNumber = () => setCustomerNumber('');

  const product = selectedContract ? state.products.find(p => p.id === selectedContract.deviceId) : null;
  const totalPaid = selectedContract?.installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.paidAmount, 0) || 0;
  const totalRemaining = selectedContract ? (selectedContract.monthlyAmount * selectedContract.months - totalPaid) : 0;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header / Search */}
        <div className="flex flex-wrap items-end gap-4 mb-8">
          {/* Customer search */}
          <div className="flex items-end gap-3 flex-1 min-w-[280px]">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم العميل</label>
              <div className="flex items-center gap-2">
                <button onClick={clearCustomerNumber} className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                  <Minus size={20} />
                </button>
                <input type="text" value={customerNumber} onChange={e => setCustomerNumber(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="رقم الصفحة / الهاتف / الاسم"
                  className="w-full border-gray-300 rounded-lg p-3 border focus:ring-indigo-500 focus:border-indigo-500 h-12" />
              </div>
            </div>
            <button onClick={handleSearch} className="bg-indigo-600 text-white h-12 px-6 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
              <Search size={20} /> بحث
            </button>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
            <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)}
              className="w-48 border-gray-300 rounded-lg p-3 border focus:ring-indigo-500 focus:border-indigo-500 h-12" />
          </div>
        </div>

        {selectedContract && (
          <>
            {/* Customer & Guarantor Data */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden mb-6">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
                  {/* Right column - Customer */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className="font-bold text-gray-600 w-32 shrink-0 text-sm">اسم العميل</label>
                      <input type="text" value={selectedContract.name} readOnly
                        className="flex-1 border-gray-200 rounded-lg p-3 border bg-gray-50 text-gray-900 text-sm" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="font-bold text-gray-600 w-32 shrink-0 text-sm">رقم التليفون</label>
                      <input type="text" value={selectedContract.phone} readOnly
                        className="flex-1 border-gray-200 rounded-lg p-3 border bg-gray-50 text-gray-900 text-sm" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="font-bold text-gray-600 w-32 shrink-0 text-sm">العنوان</label>
                      <input type="text" value={selectedContract.address || ''} readOnly
                        className="flex-1 border-gray-200 rounded-lg p-3 border bg-gray-50 text-gray-900 text-sm" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="font-bold text-gray-600 w-32 shrink-0 text-sm">اسم الجهاز</label>
                      <input type="text" value={product?.name || 'غير معروف'} readOnly
                        className="flex-1 border-gray-200 rounded-lg p-3 border bg-gray-50 text-gray-900 text-sm" />
                    </div>
                  </div>

                  {/* Left column - Guarantor & Price */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className="font-bold text-gray-600 w-32 shrink-0 text-sm">الضامن</label>
                      <input type="text" value={selectedContract.guarantor1Name || ''} readOnly
                        className="flex-1 border-gray-200 rounded-lg p-3 border bg-gray-50 text-gray-900 text-sm" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="font-bold text-gray-600 w-32 shrink-0 text-sm">رقم الهاتف</label>
                      <input type="text" value={selectedContract.guarantor1Phone || ''} readOnly
                        className="flex-1 border-gray-200 rounded-lg p-3 border bg-gray-50 text-gray-900 text-sm" />
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <label className="font-bold text-gray-600 w-32 shrink-0 text-sm">سعر الجهاز</label>
                      <input type="text" value={`${selectedContract.devicePrice.toFixed(2)} ج`} readOnly
                        className="flex-1 border-gray-200 rounded-lg p-3 border bg-gray-50 text-gray-900 text-sm font-bold text-indigo-700" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Data */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden mb-6">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المقدم</label>
                    <input type="text" value={`${selectedContract.downPayment.toFixed(2)} ج`} readOnly
                      className="w-full border-gray-200 rounded-lg p-3 border bg-gray-50 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">النسبة</label>
                    <input type="text" value={`${selectedContract.installmentPercentage || 0}%`} readOnly
                      className="w-full border-gray-200 rounded-lg p-3 border bg-gray-50 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عدد الشهور</label>
                    <input type="text" value={selectedContract.months.toString()} readOnly
                      className="w-full border-gray-200 rounded-lg p-3 border bg-gray-50 text-gray-900" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الإجمالي بعد المقدم</label>
                    <input type="text" value={`${(selectedContract.monthlyAmount * selectedContract.months).toFixed(2)} ج`} readOnly
                      className="w-full border-gray-200 rounded-lg p-3 border bg-gray-50 text-gray-900 font-bold text-indigo-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الدفعات الشهرية</label>
                    <input type="text" value={`${selectedContract.monthlyAmount.toFixed(2)} ج`} readOnly
                      className="w-full border-gray-200 rounded-lg p-3 border bg-gray-50 text-gray-900 font-bold text-indigo-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Installment Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-indigo-50 text-indigo-900 border-b border-gray-200">
                      <th className="p-4 font-bold border-l border-indigo-100 text-center w-24">رقم القسط</th>
                      <th className="p-4 font-bold border-l border-indigo-100">تاريخ الدفعات</th>
                      <th className="p-4 font-bold border-l border-indigo-100">مبلغ الدفع</th>
                      <th className="p-4 font-bold w-48">تاريخ الدفع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedContract.installments.map(inst => {
                      const isPaid = inst.status === 'paid';
                      return (
                        <tr key={inst.id} className={`border-b border-gray-100 transition-colors ${isPaid ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                          <td className="p-4 font-bold text-indigo-900 text-lg text-center">{inst.monthNumber}</td>
                          <td className="p-4 font-medium">{inst.expectedDate}</td>
                          <td className="p-4">
                            {isPaid ? (
                              <span className="font-bold text-green-700">{inst.paidAmount.toFixed(2)} ج</span>
                            ) : (
                              <span className="font-bold text-gray-900">{inst.amount.toFixed(2)} ج</span>
                            )}
                          </td>
                          <td className="p-4">
                            {isPaid ? (
                              <span className="flex items-center gap-1 text-green-700 font-bold">
                                <Check size={16} /> {inst.actualDate}
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <input type="date" defaultValue={paymentDate}
                                  className="border border-gray-200 rounded px-3 py-2 text-sm w-40" id={`date-${inst.id}`} />
                                <button onClick={() => {
                                  const dateInput = document.getElementById(`date-${inst.id}`) as HTMLInputElement;
                                  handlePayInstallment(inst.id, inst.amount);
                                }}
                                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 font-bold transition-colors">
                                  دفع
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile view */}
              <div className="md:hidden divide-y divide-gray-200">
                {selectedContract.installments.map(inst => {
                  const isPaid = inst.status === 'paid';
                  return (
                    <div key={inst.id} className={`p-4 ${isPaid ? 'bg-green-50' : ''}`}>
                      <button onClick={() => setExpandedRow(expandedRow === inst.id ? null : inst.id)}
                        className="w-full flex items-center justify-between mb-2">
                        <span className="font-bold text-indigo-900">القسط {inst.monthNumber}</span>
                        <span className={isPaid ? 'text-green-700 font-bold' : 'text-gray-700 font-bold'}>
                          {isPaid ? `${inst.paidAmount.toFixed(2)} ج` : `${inst.amount.toFixed(2)} ج`}
                        </span>
                      </button>
                      {expandedRow === inst.id && (
                        <div className="space-y-2 text-sm pr-2">
                          <div className="flex justify-between"><span className="text-gray-500">تاريخ الدفعات:</span><span>{inst.expectedDate}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">تاريخ الدفع:</span>
                            <span>{isPaid ? inst.actualDate : '-'}</span>
                          </div>
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 text-green-700 font-bold"><Check size={16} /> مسدد</span>
                          ) : (
                            <div className="flex gap-2 mt-2">
                              <input type="date" defaultValue={paymentDate} className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm" id={`mdate-${inst.id}`} />
                              <button onClick={() => {
                                const dInput = document.getElementById(`mdate-${inst.id}`) as HTMLInputElement;
                                handlePayInstallment(inst.id, inst.amount);
                              }}
                                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold">دفع</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200 flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-indigo-900">
                <span className="font-bold">الإجمالي:</span> {(selectedContract.monthlyAmount * selectedContract.months).toFixed(2)} ج
                <span className="mx-3">|</span>
                <span className="font-bold text-green-700">المدفوع:</span> {totalPaid.toFixed(2)} ج
                <span className="mx-3">|</span>
                <span className="font-bold text-red-600">المتبقي:</span> {totalRemaining.toFixed(2)} ج
              </div>
              {totalRemaining <= 0 && selectedContract.installments.length > 0 && (
                <span className="flex items-center gap-1 text-green-700 font-bold bg-green-100 px-4 py-2 rounded-lg">
                  <Check size={20} /> تم سداد كامل المبلغ
                </span>
              )}
            </div>
          </>
        )}

        {!selectedContract && (
          <div className="text-center py-20 text-gray-400">
            <Receipt size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">ابحث عن عميل لعرض بيانات السداد</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
