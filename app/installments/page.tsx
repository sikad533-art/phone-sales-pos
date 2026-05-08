"use client";

import Layout from '@/components/Layout';
import { useState, useMemo } from 'react';
import { useAppContext, InstallmentCustomer } from '@/lib/store';
import Link from 'next/link';
import { Search, Check, CreditCard } from 'lucide-react';

export default function Installments() {
  const { state, addInstallmentCustomer } = useAppContext();

  // Search existing contracts
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContract, setSelectedContract] = useState<InstallmentCustomer | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // New contract
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [productSearch, setProductSearch] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [installmentPercentage, setInstallmentPercentage] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [downPaymentMethod, setDownPaymentMethod] = useState<'cash' | 'visa' | 'instapay' | 'vodafone_cash'>('cash');
  const [visaCode, setVisaCode] = useState('');
  const [months, setMonths] = useState(10);
  const [isPaidRemaining, setIsPaidRemaining] = useState(false);

  const product = state.products.find(p => p.id === selectedProduct);
  const customer = state.customers.find(c => c.id === selectedCustomer);
  const productResults = useMemo(() => productSearch ? state.products.filter(p => p.name.includes(productSearch)) : [], [productSearch, state.products]);

  const handleSearchContract = () => {
    if (!searchQuery) return;
    const found = state.installmentCustomers.find(c =>
      c.name.includes(searchQuery) || c.phone.includes(searchQuery) || c.notebookPage === searchQuery
    );
    setSelectedContract(found || null);
    if (!found) alert('لم يتم العثور على عقد');
  };

  const handleCreate = () => {
    if (!selectedCustomer || !selectedProduct || !downPayment) {
      alert('اختر العميل والجهاز وأدخل العربون');
      return;
    }
    if (!customer || !product) return;

    const price = product.price;
    const afterDiscount = price - (price * discountPercentage / 100);
    const afterDown = afterDiscount - downPayment;
    const totalRemaining = afterDown + (afterDown * installmentPercentage / 100);
    const monthlyAmount = isPaidRemaining || months === 0 ? 0 : totalRemaining / months;

    const installments = isPaidRemaining ? [] : Array.from({ length: months }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() + i + 1);
      return { id: Math.random().toString(36).substr(2, 9), monthNumber: i + 1, expectedDate: d.toISOString().split('T')[0], amount: monthlyAmount, paidAmount: 0, status: 'unpaid' as const };
    });

    const contract: InstallmentCustomer = {
      id: Math.random().toString(36).substr(2, 9),
      notebookPage: customer.idCardNumber || '',
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      idCardNumber: customer.idCardNumber,
      areaType: customer.areaType || 'inside',
      deviceId: product.id,
      devicePrice: price,
      discountPercentage,
      installmentPercentage,
      downPayment,
      downPaymentMethod,
      visaCode: downPaymentMethod !== 'cash' ? visaCode : undefined,
      paidRemaining: isPaidRemaining,
      isDelivered: true,
      months: isPaidRemaining ? 0 : months,
      monthlyAmount,
      installments,
      guarantor1Name: customer.guarantor1Name,
      guarantor1Phone: customer.guarantor1Phone,
    };

    addInstallmentCustomer(contract);
    alert('تم إنشاء عقد العربون/التقسيط بنجاح ✅');
    setSelectedCustomer(''); setSelectedProduct(''); setDownPayment(0); setMonths(10);
    setIsPaidRemaining(false); setDiscountPercentage(0); setInstallmentPercentage(0);
    setVisaCode(''); setDownPaymentMethod('cash');
  };

  const remainingAmount = product && !isPaidRemaining && months > 0
    ? ((product.price - (product.price * discountPercentage / 100)) - downPayment) * (1 + installmentPercentage / 100)
    : 0;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
          <CreditCard size={24} /> مبيعات العربون والتقسيط
        </h2>

        {/* Search Existing Contracts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">بحث عن عقد موجود</label>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearchContract()}
                placeholder="ابحث بالاسم أو رقم التليفون..."
                className="w-full border-gray-300 rounded-lg p-3 border focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <button onClick={handleSearchContract} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"><Search size={20} /> بحث</button>
          </div>

          {selectedContract && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-gray-500">العميل:</span> <span className="font-bold">{selectedContract.name}</span></div>
                <div><span className="text-gray-500">الجهاز:</span> <span className="font-bold">{state.products.find(p => p.id === selectedContract.deviceId)?.name || '-'}</span></div>
                <div><span className="text-gray-500">المقدم:</span> <span className="font-bold">{selectedContract.downPayment} ج</span></div>
                <div><span className="text-gray-500">المتبقي:</span> <span className="font-bold text-indigo-700">{(selectedContract.months * selectedContract.monthlyAmount - selectedContract.installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.paidAmount, 0)).toFixed(2)} ج</span></div>
              </div>
              <Link href="/payments" className="mt-3 inline-flex items-center gap-1 text-indigo-600 font-medium text-sm hover:underline">
                <CreditCard size={16} /> الذهاب لصفحة السداد
              </Link>
            </div>
          )}
        </div>

        {/* New Contract */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-indigo-900 mb-6">🔖 عقد عربون جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Customer Selection */}
            <div className="space-y-5">
              <h4 className="font-bold text-gray-800 border-b pb-2">اختيار العميل</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اختر عميل <span className="text-red-500">*</span></label>
                <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}
                  className="w-full border-gray-300 rounded-lg p-3 border">
                  <option value="">-- اختر عميل --</option>
                  {state.customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                </select>
                {selectedCustomer && customer && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                    <p><span className="text-gray-500">العنوان:</span> {customer.address || '-'}</p>
                    <p><span className="text-gray-500">الضامن:</span> {customer.guarantor1Name || '-'} {customer.guarantor1Phone ? `(${customer.guarantor1Phone})` : ''}</p>
                  </div>
                )}
              </div>

              <h4 className="font-bold text-gray-800 border-b pb-2">اختيار الجهاز</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الجهاز المباع <span className="text-red-500">*</span></label>
                {selectedProduct ? (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex justify-between items-center">
                    <span className="font-bold text-green-700">{product?.name} - {product?.price} ج</span>
                    <button onClick={() => setSelectedProduct('')} className="text-xs text-red-500 hover:underline">تغيير</button>
                  </div>
                ) : (
                  <div className="relative">
                    <input type="text" placeholder="ابحث عن جهاز..." value={productSearch} onChange={e => setProductSearch(e.target.value)}
                      className="w-full border-gray-300 rounded-lg p-3 border pr-10" />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    {productSearch && productResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-xl max-h-48 overflow-auto z-10 rounded-lg mt-1">
                        {productResults.map(p => (
                          <div key={p.id} onClick={() => { setSelectedProduct(p.id); setProductSearch(''); }}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b text-sm flex justify-between">
                            <span>{p.name}</span><span className="text-gray-500">{p.price} ج</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Installment Terms */}
            <div className="space-y-5 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 border-b pb-2">بيانات العربون والتقسيط</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر الجهاز</label>
                  <input type="number" disabled value={product?.price || ''} className="w-full border-gray-300 rounded-lg p-3 border bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نسبة الخصم %</label>
                  <input type="number" min="0" max="100" value={discountPercentage} onChange={e => setDiscountPercentage(Number(e.target.value) || 0)} className="w-full border-gray-300 rounded-lg p-3 border" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العربون (المقدم) <span className="text-red-500">*</span></label>
                  <input type="number" value={downPayment} onChange={e => setDownPayment(Number(e.target.value) || 0)} className="w-full border-gray-300 rounded-lg p-3 border font-bold text-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">طريقة سداد العربون</label>
                  <select value={downPaymentMethod} onChange={e => setDownPaymentMethod(e.target.value as any)} className="w-full border-gray-300 rounded-lg p-3 border">
                    <option value="cash">نقدي</option>
                    <option value="visa">فيزا</option>
                    <option value="instapay">إنستاباي</option>
                    <option value="vodafone_cash">فودافون كاش</option>
                  </select>
                </div>
              </div>

              {downPaymentMethod !== 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">كود الفيزا / آخر 4 أرقام</label>
                  <input type="text" value={visaCode} onChange={e => setVisaCode(e.target.value)} className="w-full border-gray-300 rounded-lg p-3 border bg-yellow-50" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نسبة القسط للزبون %</label>
                  <input type="number" min="0" max="100" value={installmentPercentage} onChange={e => setInstallmentPercentage(Number(e.target.value) || 0)} className="w-full border-gray-300 rounded-lg p-3 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عدد الشهور</label>
                  <input type="number" min="1" disabled={isPaidRemaining} value={isPaidRemaining ? 0 : months} onChange={e => setMonths(Number(e.target.value) || 1)} className="w-full border-gray-300 rounded-lg p-3 border" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-green-700 font-medium bg-green-50 p-3 rounded-lg">
                <input type="checkbox" className="w-5 h-5 rounded text-green-600" checked={isPaidRemaining} onChange={e => setIsPaidRemaining(e.target.checked)} />
                سدد الباقي كاش (بدون أقساط)
              </label>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-600">السعر بعد الخصم:</span><span className="font-bold">{product ? (product.price - (product.price * discountPercentage / 100)).toFixed(2) : 0} ج</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">المتبقي بعد العربون:</span><span className="font-bold">{product ? ((product.price - (product.price * discountPercentage / 100)) - downPayment).toFixed(2) : 0} ج</span></div>
                {!isPaidRemaining && months > 0 && (
                  <>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">الإجمالي + نسبة القسط:</span><span className="font-bold text-indigo-700">{remainingAmount.toFixed(2)} ج</span></div>
                    <div className="flex justify-between text-lg border-t border-gray-200 pt-2"><span className="text-gray-700 font-bold">الدفعة الشهرية:</span><span className="font-black text-indigo-700">{(remainingAmount / months).toFixed(2)} ج</span></div>
                  </>
                )}
              </div>

              <button onClick={handleCreate}
                className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 text-lg mt-4">
                <CreditCard size={22} /> حفظ عقد العربون
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
