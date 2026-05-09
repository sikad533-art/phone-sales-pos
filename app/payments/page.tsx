"use client";

import Layout from '@/components/Layout';
import { useState } from 'react';
import { useAppContext } from '@/lib/store';
import type { InstallmentCustomer } from '@/lib/store';
import { Search } from 'lucide-react';

export default function Payments() {
  const { state, updateInstallment } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContract, setSelectedContract] = useState<InstallmentCustomer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const today = new Date().toLocaleDateString('en-GB');

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const found = state.installmentCustomers.find(c =>
      c.notebookPage === searchQuery || c.phone.includes(searchQuery) || c.name.includes(searchQuery) || c.idCardNumber === searchQuery
    );
    setSelectedContract(found || null);
    if (found) {
      // Calculate remaining payment and set default
      const totalRemaining = (found.monthlyAmount * found.months) - found.installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.paidAmount, 0);
      setPaymentAmount(found.monthlyAmount > totalRemaining ? totalRemaining : found.monthlyAmount);
    } else {
      alert('لم يتم العثور على عقد');
    }
  };

  const handlePay = () => {
    if (!selectedContract) return;
    const unpaidInstallment = selectedContract.installments.find(i => i.status !== 'paid');
    if (!unpaidInstallment) {
      alert('جميع الأقساط مسددة');
      return;
    }
    if (paymentAmount <= 0) {
      alert('أدخل مبلغ الدفع');
      return;
    }
    const actualDate = new Date().toISOString().split('T')[0];
    updateInstallment(selectedContract.id, unpaidInstallment.id, paymentAmount, actualDate);
    setSelectedContract(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        installments: prev.installments.map(inst =>
          inst.id === unpaidInstallment.id
            ? { ...inst, status: 'paid', paidAmount: paymentAmount, actualDate }
            : inst
        )
      };
    });
    alert('تم تسديد الدفعة بنجاح');
  };

  const totalAmount = selectedContract ? selectedContract.monthlyAmount * selectedContract.months : 0;
  const totalPaid = selectedContract
    ? selectedContract.installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.paidAmount, 0)
    : 0;
  const remainingAmount = totalAmount - totalPaid;
  const product = selectedContract ? state.products.find(p => p.id === selectedContract.deviceId) : null;
  const startDate = selectedContract?.installments[0]?.expectedDate
    ? new Date(selectedContract.installments[0].expectedDate)
    : new Date();

  return (
    <Layout>
      <div className="min-h-[calc(100vh-60px)] px-4 py-6" dir="rtl">
        <div className="w-full max-w-5xl mx-auto bg-white border-2 border-gray-400 p-6 shadow-xl relative mt-4">
          {/* Header with search + date */}
          <div className="flex flex-col md:flex-row justify-between mb-8 gap-4 border-b border-gray-300 pb-6">
            <div className="flex gap-2 w-full md:w-1/2">
              <div className="bg-[#111] text-white px-4 flex items-center justify-center font-bold text-sm w-32 shrink-0">رقم العميل :</div>
              <div className="flex flex-1 border border-gray-400">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="رقم الصفحة / الهاتف / الاسم"
                  className="w-full px-3 outline-none font-bold text-right" />
                <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-4 flex items-center justify-center border-r border-gray-400">
                  <Search size={18} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-1/3">
              <div className="bg-[#111] text-white px-4 flex items-center justify-center font-bold text-sm w-24 shrink-0">التاريخ :</div>
              <div className="flex-1 border border-gray-400 flex items-center justify-center font-bold bg-gray-50">{today}</div>
            </div>
          </div>

          {selectedContract ? (
            <>
              {/* Customer Data */}
              <div className="flex flex-col gap-4">
                {/* Row 1: name + guarantor */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex h-10 border border-gray-400 w-full sm:w-1/2">
                    <div className="bg-blue-100 text-blue-900 border-l border-gray-400 px-3 flex items-center justify-center font-bold text-sm w-32 shrink-0">اسم العميل :</div>
                    <input type="text" readOnly value={selectedContract.name} className="w-full px-3 outline-none font-bold text-right bg-gray-50" />
                  </div>
                  <div className="flex h-10 border border-gray-400 w-full sm:w-1/2">
                    <div className="bg-blue-100 text-blue-900 border-l border-gray-400 px-3 flex items-center justify-center font-bold text-sm w-32 shrink-0">الضامن :</div>
                    <input type="text" readOnly value={selectedContract.guarantor1Name || ''} className="w-full px-3 outline-none font-bold text-right bg-gray-50" />
                  </div>
                </div>

                {/* Row 2: phone + guarantor phone */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex h-10 border border-gray-400 w-full sm:w-1/2">
                    <div className="bg-blue-100 text-blue-900 border-l border-gray-400 px-3 flex items-center justify-center font-bold text-sm w-32 shrink-0">رقم التليفون :</div>
                    <input type="text" readOnly value={selectedContract.phone} className="w-full px-3 outline-none font-bold text-right bg-gray-50" dir="ltr" />
                  </div>
                  <div className="flex h-10 border border-gray-400 w-full sm:w-1/2">
                    <div className="bg-blue-100 text-blue-900 border-l border-gray-400 px-3 flex items-center justify-center font-bold text-sm w-32 shrink-0">رقم الهاتف (الضامن) :</div>
                    <input type="text" readOnly value={selectedContract.guarantor1Phone || ''} className="w-full px-3 outline-none font-bold text-right bg-gray-50" dir="ltr" />
                  </div>
                </div>

                {/* Row 3: address (full width) */}
                <div className="flex h-10 border border-gray-400 w-full">
                  <div className="bg-blue-100 text-blue-900 border-l border-gray-400 px-3 flex items-center justify-center font-bold text-sm w-32 shrink-0">العنوان :</div>
                  <input type="text" readOnly value={selectedContract.address || ''} className="w-full px-3 outline-none font-bold text-right bg-gray-50" />
                </div>

                {/* Row 4: device name + price (teal) */}
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <div className="flex h-10 border border-gray-400 w-full sm:w-1/2">
                    <div className="bg-teal-100 text-teal-900 border-l border-gray-400 px-3 flex items-center justify-center font-bold text-sm w-32 shrink-0">اسم الجهاز :</div>
                    <input type="text" readOnly value={product?.name || 'غير معروف'} className="w-full px-3 outline-none font-bold text-right bg-gray-50" />
                  </div>
                  <div className="flex h-10 border border-gray-400 w-full sm:w-1/2">
                    <div className="bg-teal-100 text-teal-900 border-l border-gray-400 px-3 flex items-center justify-center font-bold text-sm w-32 shrink-0">سعر الجهاز :</div>
                    <input type="text" readOnly value={`${selectedContract.devicePrice.toFixed(2)}`} className="w-full px-3 outline-none font-bold text-right bg-gray-50" />
                  </div>
                </div>

                {/* Financial Row 1 */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex flex-1 h-10 border border-gray-400 text-sm">
                    <div className="bg-yellow-100 text-yellow-900 border-l border-gray-400 px-2 flex items-center justify-center font-bold w-24 shrink-0">المقدم :</div>
                    <input type="text" readOnly value={selectedContract.downPayment.toFixed(2)} className="w-full px-2 outline-none font-bold text-center bg-gray-50" />
                  </div>
                  <div className="flex flex-1 h-10 border border-gray-400 text-sm">
                    <div className="bg-yellow-100 text-yellow-900 border-l border-gray-400 px-2 flex items-center justify-center font-bold w-24 shrink-0">النسبة :</div>
                    <input type="text" readOnly value={`${selectedContract.installmentPercentage || 0}%`} className="w-full px-2 outline-none font-bold text-center bg-gray-50" />
                  </div>
                  <div className="flex flex-1 h-10 border border-blue-400 text-sm">
                    <div className="bg-blue-100 text-blue-900 border-l border-blue-400 px-2 flex items-center justify-center font-bold w-36 shrink-0">الإجمالي بعد المقدم :</div>
                    <input type="text" readOnly value={`${totalAmount.toFixed(2)}`} className="w-full px-2 outline-none font-bold text-center bg-blue-50 text-blue-700" />
                  </div>
                </div>

                {/* Financial Row 2: months + monthly payment */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-2 pb-2">
                  <div className="flex h-12 border border-gray-400 w-full sm:w-1/2">
                    <div className="bg-yellow-100 text-yellow-900 border-l border-gray-400 px-2 flex items-center justify-center font-bold w-28 shrink-0">عدد الشهور :</div>
                    <input type="text" readOnly value={selectedContract.months} className="w-full px-2 outline-none font-bold text-center bg-gray-50" />
                  </div>
                  <div className="flex h-12 border-2 border-red-300 w-full sm:w-1/2 font-bold">
                    <div className="bg-red-50 text-red-900 border-l border-red-300 px-3 flex items-center justify-center w-40 shrink-0">الدفعة الشهرية :</div>
                    <div className="w-full px-3 outline-none flex items-center justify-center bg-red-50 text-red-600 text-xl">{selectedContract.monthlyAmount.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Installment Table */}
              <div className="w-full border-2 border-gray-500 overflow-hidden mt-2">
                {/* Table Header */}
                <div className="flex bg-[#111] text-white font-bold h-10">
                  <div className="flex-[0.5] flex items-center justify-center border-l border-gray-500 text-sm">رقم القسط</div>
                  <div className="flex-1 flex items-center justify-center border-l border-gray-500 text-sm">تاريخ الدفعات (المتوقع)</div>
                  <div className="flex-1 flex items-center justify-center border-l border-gray-500 text-sm">مبلغ الدفع</div>
                  <div className="flex-1 flex items-center justify-center border-l border-gray-500 text-sm">تاريخ الدفع (المتوقع)</div>
                  <div className="flex-1 flex items-center justify-center text-sm">الحالة</div>
                </div>

                {/* Table Rows */}
                {(() => {
                  const rows: React.ReactNode[] = [];
                  const maxMonths = Math.max(
                    selectedContract.months,
                    selectedContract.installments.filter(i => i.status === 'paid').length + (remainingAmount > 0 ? 1 : 0)
                  );

                  for (let i = 0; i < maxMonths; i++) {
                    const monthNum = i + 1;
                    const paidInstallment = selectedContract.installments.find(inst => inst.monthNumber === monthNum && inst.status === 'paid');
                    const isCurrentUnpaid = !paidInstallment && remainingAmount > 0 && i === selectedContract.installments.filter(inst => inst.status === 'paid').length;
                    const isFuture = !paidInstallment && !isCurrentUnpaid;

                    const expectedDate = new Date(startDate);
                    expectedDate.setMonth(expectedDate.getMonth() + monthNum);
                    const dateStr = expectedDate.toLocaleDateString('en-GB');

                    if (paidInstallment) {
                      rows.push(
                        <div key={`paid-${monthNum}`} className="flex bg-white h-10 border-b border-gray-300 font-bold">
                          <div className="flex-[0.5] flex items-center justify-center border-l border-gray-300 text-sm">{monthNum}</div>
                          <div className="flex-1 flex items-center justify-center border-l border-gray-300 text-sm text-gray-800">{dateStr}</div>
                          <div className="flex-1 flex items-center justify-center border-l border-gray-300 text-sm text-green-700">{paidInstallment.paidAmount.toFixed(2)}</div>
                          <div className="flex-1 flex items-center justify-center border-l border-gray-300 text-sm">{paidInstallment.actualDate ? new Date(paidInstallment.actualDate).toLocaleDateString('en-GB') : '-'}</div>
                          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">تم الدفع</div>
                        </div>
                      );
                    } else if (isCurrentUnpaid) {
                      rows.push(
                        <div key={`current-${monthNum}`} className="flex bg-yellow-50 h-10 border-b-2 border-gray-500 font-bold">
                          <div className="flex-[0.5] flex items-center justify-center border-l border-gray-300 text-sm">{monthNum}</div>
                          <div className="flex-1 flex items-center justify-center border-l border-gray-300 text-sm text-blue-800">{dateStr}</div>
                          <div className="flex-1 flex items-center justify-center border-l border-gray-300 text-sm">
                            <input type="number" value={paymentAmount || ''} onChange={e => setPaymentAmount(Number(e.target.value) || 0)}
                              className="w-full px-2 outline-none text-center bg-white border border-blue-400 mx-2 text-blue-700 font-bold" placeholder="المبلغ" />
                          </div>
                          <div className="flex-1 flex items-center justify-center border-l border-gray-300 text-sm text-gray-500">{today}</div>
                          <div className="flex-1 flex items-center justify-center">
                            <button onClick={handlePay} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded shadow-sm text-sm">تسديد الدفعة</button>
                          </div>
                        </div>
                      );
                    } else {
                      rows.push(
                        <div key={`future-${monthNum}`} className="flex bg-gray-50 h-10 border-b border-gray-200">
                          <div className="flex-[0.5] flex items-center justify-center border-l border-gray-300 text-sm text-gray-400 font-bold">{monthNum}</div>
                          <div className="flex-1 flex items-center justify-center border-l border-gray-300 text-sm text-gray-500 font-bold">{dateStr}</div>
                          <div className="flex-1 flex items-center justify-center border-l border-gray-300 text-sm text-gray-400">-</div>
                          <div className="flex-1 flex items-center justify-center border-l border-gray-300 text-sm text-gray-400">-</div>
                          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">-</div>
                        </div>
                      );
                    }
                  }
                  return rows;
                })()}

                {/* Table Footer: remaining total */}
                <div className="flex bg-gray-200 h-10 font-bold border-t-2 border-gray-500">
                  <div className="flex-[0.5] border-l border-gray-400"></div>
                  <div className="flex-1 flex items-center justify-end px-4 border-l border-gray-400 text-red-700">إجمالي المتبقي :</div>
                  <div className="flex-1 flex items-center justify-center border-l border-gray-400 text-red-700 text-lg">{remainingAmount.toFixed(2)}</div>
                  <div className="flex-1"></div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <div className="text-7xl mb-4 opacity-30 font-black">?</div>
              <p className="text-lg font-bold">ابحث عن عميل لعرض بيانات السداد</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
