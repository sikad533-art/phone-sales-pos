"use client";

import Layout from '@/components/Layout';
import { useState } from 'react';
import { useAppContext, InstallmentCustomer, Product } from '@/lib/store';
import { Search, Plus, Calendar, Check, User, Phone, MapPin, FileDigit, Smartphone } from 'lucide-react';

export default function Installments() {
  const { state, addInstallmentCustomer, updateInstallment } = useAppContext();
  const [activeTab, setActiveTab] = useState<'search' | 'new'>('search');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<InstallmentCustomer | null>(null);

  // New Contract State
  const [newCust, setNewCust] = useState<Partial<InstallmentCustomer>>({ months: 10 });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState('');

  // Find customer
  const handleSearch = () => {
    if (!searchQuery) return;
    const found = state.installmentCustomers.find(c => 
      c.name.includes(searchQuery) || 
      c.phone.includes(searchQuery) || 
      c.notebookPage === searchQuery ||
      c.idCardNumber === searchQuery
    );
    setSelectedCustomer(found || null);
    if (!found) alert('لم يتم العثور على عميل');
  };

  const handlePayInstallment = (installmentId: string, amount: number) => {
    if (!selectedCustomer) return;
    const actualDate = new Date().toISOString().split('T')[0];
    updateInstallment(selectedCustomer.id, installmentId, amount, actualDate);
    // Update local state to reflect change immediately without re-rendering everything from context
    setSelectedCustomer(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        installments: prev.installments.map(inst => 
          inst.id === installmentId ? { ...inst, status: 'paid', paidAmount: amount, actualDate } : inst
        )
      }
    });
  };

  const handleCreateContract = () => {
    if (!newCust.name || !newCust.phone || !selectedProduct || !newCust.downPayment || !newCust.months) {
      alert('الرجاء إكمال البيانات الأساسية');
      return;
    }

    const price = selectedProduct.price;
    const discount = newCust.discountPercentage || 0;
    const remainingBeforeFees = (price - (price * discount / 100)) - (newCust.downPayment || 0);
    const totalRemaining = remainingBeforeFees + (remainingBeforeFees * (newCust.installmentPercentage || 0) / 100);

    let monthlyAmount = 0;
    let installments: any[] = [];

    if (!newCust.paidRemaining && (newCust.months || 0) > 0) {
      monthlyAmount = totalRemaining / (newCust.months || 1);
      installments = Array.from({ length: newCust.months || 1 }).map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() + i + 1);
        return {
          id: Math.random().toString(36).substr(2, 9),
          monthNumber: i + 1,
          expectedDate: date.toISOString().split('T')[0],
          amount: monthlyAmount,
          paidAmount: 0,
          status: 'unpaid' as const,
        };
      });
    }

    const customer: InstallmentCustomer = {
      id: Math.random().toString(36).substr(2, 9),
      notebookPage: newCust.notebookPage || '',
      name: newCust.name,
      phone: newCust.phone,
      address: newCust.address || '',
      idCardNumber: newCust.idCardNumber,
      areaType: newCust.areaType || 'inside',
      deviceId: selectedProduct.id,
      devicePrice: price,
      discountPercentage: discount,
      installmentPercentage: newCust.installmentPercentage || 0,
      downPayment: newCust.downPayment || 0,
      downPaymentMethod: newCust.downPaymentMethod || 'cash',
      visaCode: newCust.visaCode,
      paidRemaining: newCust.paidRemaining || false,
      isDelivered: newCust.isDelivered || false,
      months: newCust.paidRemaining ? 0 : (newCust.months || 1),
      monthlyAmount,
      installments,
      guarantor1Name: newCust.guarantor1Name,
      guarantor1Phone: newCust.guarantor1Phone,
    };

    addInstallmentCustomer(customer);
    alert('تم إنشاء التعاقد بنجاح!');
    setActiveTab('search');
    setSearchQuery(customer.phone);
    setSelectedCustomer(customer);
    setNewCust({ months: 10 });
    setSelectedProduct(null);
    setProductSearch('');
  };

  const productSearchResults = productSearch 
    ? state.products.filter(p => p.name.includes(productSearch))
    : [];

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-4 font-semibold text-lg flex justify-center items-center gap-2 ${activeTab === 'search' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={20} />
            بحث وسداد أقساط
          </button>
          <button 
            className={`flex-1 py-4 font-semibold text-lg flex justify-center items-center gap-2 ${activeTab === 'new' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('new')}
          >
            <Plus size={20} />
            تعاقد جديد
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'search' && (
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">بحث برقم الصفحة، الهاتف، أو الاسم</label>
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="أدخل عبارة البحث..."
                    className="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Search size={20} />
                  بحث
                </button>
              </div>

              {selectedCustomer && (
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50 p-6 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      
                      {/* Row 1 */}
                      <div className="flex items-center gap-4">
                         <label className="w-32 font-bold text-gray-700 whitespace-nowrap">اسم العميل</label>
                         <input type="text" readOnly className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-200/60 font-medium text-gray-800" value={selectedCustomer.name || ''} />
                      </div>
                      <div className="flex items-center gap-4">
                         <label className="w-32 font-bold text-gray-700 whitespace-nowrap">التاريخ</label>
                         <input type="text" readOnly className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-200/60 font-medium text-gray-800" value={selectedCustomer.installments[0] ? (() => {const d = new Date(selectedCustomer.installments[0].expectedDate); d.setMonth(d.getMonth()-1); return d.toISOString().split('T')[0]})() : ''} />
                      </div>

                      {/* Row 2 */}
                      <div className="flex items-center gap-4">
                         <label className="w-32 font-bold text-gray-700 whitespace-nowrap">رقم التليفون</label>
                         <input type="text" readOnly className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-200/60 font-medium text-gray-800" value={selectedCustomer.phone || ''} />
                      </div>
                      <div className="flex items-center gap-4">
                         <label className="w-32 font-bold text-gray-700 whitespace-nowrap">اسم الضامن</label>
                         <input type="text" readOnly className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-200/60 font-medium text-gray-800" value={selectedCustomer.guarantor1Name || ''} />
                      </div>

                      {/* Row 3 - Address full width, guarantor phone */}
                      <div className="flex items-center gap-4">
                         <label className="w-32 font-bold text-gray-700 whitespace-nowrap">العنوان</label>
                         <input type="text" readOnly className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-200/60 font-medium text-gray-800" value={selectedCustomer.address || ''} />
                      </div>
                      <div className="flex items-center gap-4">
                         <label className="w-32 font-bold text-gray-700 whitespace-nowrap">هاتف الضامن</label>
                         <input type="text" readOnly className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-200/60 font-medium text-gray-800" value={selectedCustomer.guarantor1Phone || ''} />
                      </div>

                      {/* Row 4 */}
                      <div className="flex items-center gap-4">
                         <label className="w-32 font-bold text-gray-700 whitespace-nowrap">اسم الجهاز</label>
                         <input type="text" readOnly className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-200/60 font-medium text-gray-800" value={state.products.find(p => p.id === selectedCustomer.deviceId)?.name || 'غير معروف'} />
                      </div>
                      <div className="flex items-center gap-4">
                         <label className="w-32 font-bold text-gray-700 whitespace-nowrap">سعر الجهاز</label>
                         <input type="text" readOnly className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-200/60 font-medium text-gray-800" value={selectedCustomer.devicePrice || ''} />
                      </div>

                      {/* Row 5 */}
                      <div className="flex items-center gap-4">
                         <label className="w-32 font-bold text-gray-700 whitespace-nowrap">المقدم</label>
                         <input type="text" readOnly className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-200/60 font-medium text-gray-800" value={selectedCustomer.downPayment || 0} />
                      </div>
                      <div className="flex items-center gap-4">
                         <label className="w-32 font-bold text-gray-700 whitespace-nowrap">عدد الشهور</label>
                         <input type="text" readOnly className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-200/60 font-medium text-gray-800" value={selectedCustomer.months || 0} />
                      </div>

                      {/* Row 6 */}
                      <div className="flex items-center gap-4">
                         <label className="w-32 font-bold text-gray-700 whitespace-nowrap">الإجمالي بعد المقدم</label>
                         <input type="text" readOnly className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-200/60 font-black text-indigo-900 shadow-inner" value={(selectedCustomer.monthlyAmount * selectedCustomer.months).toFixed(2)} />
                      </div>
                      <div className="flex items-center gap-4">
                         <label className="w-32 font-bold text-gray-700 whitespace-nowrap">الدفعة الشهرية</label>
                         <input type="text" readOnly className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-200/60 font-black text-indigo-900 shadow-inner" value={selectedCustomer.monthlyAmount?.toFixed(2)} />
                      </div>

                    </div>
                  </div>
                  
                  {selectedCustomer.paidRemaining ? (
                    <div className="p-8 text-center text-green-700 bg-green-50 mt-4 mx-6 mb-6 rounded-xl border border-green-200">
                      <Check size={48} className="mx-auto mb-2" />
                      <h4 className="text-xl font-bold">تم سداد سعر الجهاز بالكامل (بدون أقساط)</h4>
                      <p className="text-green-800 mt-2 font-medium">طريقة سداد العربون: {selectedCustomer.downPaymentMethod}</p>
                    </div>
                  ) : (
                    <div className="p-6">
                      <table className="w-full text-right border-collapse text-sm border border-gray-200 rounded-lg overflow-hidden block md:table">
                      <thead className="hidden md:table-header-group">
                        <tr className="bg-indigo-50 text-indigo-900 border-b border-indigo-100">
                          <th className="p-4 font-bold border-l border-indigo-100">رقم القسط</th>
                          <th className="p-4 font-bold border-l border-indigo-100">تاريخ الدفعات</th>
                          <th className="p-4 font-bold border-l border-indigo-100">مبلغ الدفع</th>
                          <th className="p-4 font-bold border-l border-indigo-100">تاريخ الدفع</th>
                          <th className="p-4 font-bold w-32">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody className="block md:table-row-group">
                        {selectedCustomer.installments.map((inst) => {
                          const isPaid = inst.status === 'paid';
                          return (
                            <tr key={inst.id} className={`block md:table-row border-b border-gray-200 md:border-b md:border-gray-100 ${isPaid ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}>
                              <td className="p-4 md:border-l md:border-gray-100 block md:table-cell border-b border-dashed md:border-none">
                                <span className="inline-block w-1/3 md:hidden font-semibold text-gray-500">رقم القسط:</span>
                                <span className="font-bold text-indigo-900">{inst.monthNumber}</span>
                              </td>
                              <td className="p-4 md:border-l md:border-gray-100 block md:table-cell border-b border-dashed md:border-none font-medium">
                                <span className="inline-block w-1/3 md:hidden font-semibold text-gray-500">تاريخ الدفعات:</span>
                                {inst.expectedDate}
                              </td>
                              <td className="p-4 md:border-l md:border-gray-100 block md:table-cell border-b border-dashed md:border-none text-indigo-700 font-bold">
                                <span className="inline-block w-1/3 md:hidden font-semibold text-gray-500">مبلغ الدفع:</span>
                                {isPaid ? inst.paidAmount.toFixed(2) : inst.amount.toFixed(2)} ج
                              </td>
                              <td className="p-4 md:border-l md:border-gray-100 block md:table-cell border-b border-dashed md:border-none text-gray-600 font-medium">
                                <span className="inline-block w-1/3 md:hidden font-semibold text-gray-500">تاريخ الدفع:</span>
                                {inst.actualDate || '-'}
                              </td>
                              <td className="p-4 block md:table-cell">
                                {isPaid ? (
                                  <span className="flex items-center gap-1 text-green-700 font-bold justify-center bg-green-100 py-1.5 px-3 rounded text-center">
                                    <Check size={16} /> مسدد
                                  </span>
                                ) : (
                                  <button 
                                    onClick={() => handlePayInstallment(inst.id, inst.amount)}
                                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 font-bold shadow-sm transition-colors"
                                  >
                                    دفع القسط
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'new' && (
            <div className="max-w-4xl mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* بيانات العميل */}
                  <div className="space-y-5">
                    <h3 className="font-bold text-lg text-indigo-900 border-b pb-2">بيانات العميل</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">رقم الصفحة في الدفتر</label>
                      <input 
                        type="text" 
                        value={newCust.notebookPage || ''} onChange={e => setNewCust({...newCust, notebookPage: e.target.value})}
                        className="w-full border-gray-300 rounded-md p-2.5 border focus:ring-indigo-500 focus:border-indigo-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={newCust.name || ''} onChange={e => setNewCust({...newCust, name: e.target.value})}
                        className="w-full border-gray-300 rounded-md p-2.5 border focus:ring-indigo-500 focus:border-indigo-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">التليفون <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={newCust.phone || ''} onChange={e => setNewCust({...newCust, phone: e.target.value})}
                        className="w-full border-gray-300 rounded-md p-2.5 border focus:ring-indigo-500 focus:border-indigo-500" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                        <input 
                          type="text" 
                          value={newCust.address || ''} onChange={e => setNewCust({...newCust, address: e.target.value})}
                          className="w-full border-gray-300 rounded-md p-2.5 border focus:ring-indigo-500 focus:border-indigo-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم البطاقة</label>
                        <input 
                          type="text" maxLength={14}
                          value={newCust.idCardNumber || ''} onChange={e => setNewCust({...newCust, idCardNumber: e.target.value})}
                          className="w-full border-gray-300 rounded-md p-2.5 border focus:ring-indigo-500 focus:border-indigo-500" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="area" checked={newCust.areaType !== 'outside'} onChange={() => setNewCust({...newCust, areaType: 'inside'})} />
                          داخل المنطقة
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="area" checked={newCust.areaType === 'outside'} onChange={() => setNewCust({...newCust, areaType: 'outside'})} />
                          خارج المنطقة
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">حالة التسليم</label>
                      <label className="flex items-center gap-2 cursor-pointer mt-2 text-indigo-700 font-medium">
                        <input type="checkbox" className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" checked={!!newCust.isDelivered} onChange={e => setNewCust({...newCust, isDelivered: e.target.checked})} />
                        تم تسليم الجهاز للعميل
                      </label>
                    </div>
                    
                    <h3 className="font-bold text-lg text-indigo-900 border-b pb-2 pt-4">بيانات الضامن</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                      <input 
                        type="text" 
                        value={newCust.guarantor1Name || ''} onChange={e => setNewCust({...newCust, guarantor1Name: e.target.value})}
                        className="w-full border-gray-300 rounded-md p-2.5 border" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">تليفون الضامن</label>
                      <input 
                        type="text" 
                        value={newCust.guarantor1Phone || ''} onChange={e => setNewCust({...newCust, guarantor1Phone: e.target.value})}
                        className="w-full border-gray-300 rounded-md p-2.5 border" 
                      />
                    </div>
                  </div>

                  {/* بيانات التعاقد */}
                  <div className="space-y-5 bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-lg text-indigo-900 border-b pb-2">بيانات الجهاز والتقسيط</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الجهاز المباع <span className="text-red-500">*</span></label>
                      {selectedProduct ? (
                        <div className="bg-white p-3 rounded border border-green-300 flex justify-between items-center">
                          <span className="font-bold text-green-700">{selectedProduct.name}</span>
                          <button onClick={() => setSelectedProduct(null)} className="text-xs text-red-500 hover:underline">تغيير</button>
                        </div>
                      ) : (
                        <div className="relative">
                          <input 
                            type="text" placeholder="ابحث عن جهاز..."
                            value={productSearch} onChange={e => setProductSearch(e.target.value)}
                            className="w-full border-gray-300 rounded-md p-2.5 pl-10 border" 
                          />
                          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                          {productSearch && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-xl max-h-48 overflow-auto z-10 rounded-md mt-1">
                              {productSearchResults.map(p => (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="p-3 hover:bg-gray-100 cursor-pointer border-b text-sm flex justify-between">
                                  <span>{p.name}</span>
                                  <span className="text-gray-500 font-mono">{p.price} ج</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">سعر الجهاز</label>
                        <input 
                          type="number" disabled
                          value={selectedProduct?.price || ''}
                          className="w-full border-gray-300 rounded-md p-2.5 border bg-gray-100" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نسبة الخصم %</label>
                        <input 
                          type="number" min="0" max="100"
                          value={newCust.discountPercentage || ''} onChange={e => setNewCust({...newCust, discountPercentage: parseFloat(e.target.value) || 0})}
                          className="w-full border-gray-300 rounded-md p-2.5 border" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نسبة القسط للزبون %</label>
                        <input 
                          type="number" min="0" max="100"
                          value={newCust.installmentPercentage || ''} onChange={e => setNewCust({...newCust, installmentPercentage: parseFloat(e.target.value) || 0})}
                          className="w-full border-gray-300 rounded-md p-2.5 border" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer mt-1 mb-2 text-green-700 font-medium bg-green-50 p-2 rounded">
                          <input type="checkbox" className="w-5 h-5 rounded text-green-600 focus:ring-green-500" checked={!!newCust.paidRemaining} onChange={e => setNewCust({...newCust, paidRemaining: e.target.checked})} />
                          سدد الباقي (بدون أقساط)
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">العربون (المدفوع)</label>
                        <input 
                          type="number" 
                          value={newCust.downPayment || ''} onChange={e => setNewCust({...newCust, downPayment: parseFloat(e.target.value) || 0})}
                          className="w-full border-gray-300 rounded-md p-2.5 border focus:ring-indigo-500 focus:border-indigo-500 font-bold text-lg" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">عدد الشهور <span className="text-red-500">*</span></label>
                        <input 
                          type="number" disabled={!!newCust.paidRemaining}
                          value={newCust.paidRemaining ? 0 : (newCust.months || 10)} onChange={e => setNewCust({...newCust, months: parseInt(e.target.value) || 1})}
                          className="w-full border-gray-300 rounded-md p-2.5 border focus:ring-indigo-500 focus:border-indigo-500" 
                        />
                      </div>
                       <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">طريقة السداد</label>
                        <select 
                          value={newCust.downPaymentMethod || 'cash'} 
                          onChange={e => setNewCust({...newCust, downPaymentMethod: e.target.value as any})}
                          className="w-full border-gray-300 rounded-md p-2.5 border"
                        >
                          <option value="cash">نقدي</option>
                          <option value="visa">فيزا</option>
                          <option value="instapay">إنستاباي</option>
                          <option value="vodafone_cash">فودافون كاش</option>
                        </select>
                      </div>
                      {newCust.downPaymentMethod !== 'cash' && newCust.downPaymentMethod !== undefined && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">كود الفيزا / أخر 4 أرقام</label>
                          <input 
                            type="text" 
                            value={newCust.visaCode || ''} onChange={e => setNewCust({...newCust, visaCode: e.target.value})}
                            className="w-full border-gray-300 rounded-md p-2.5 border bg-yellow-50" 
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-200 mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">المبلغ بعد العربون:</span>
                        <span className="font-semibold text-lg text-gray-800">
                          {selectedProduct ? ((selectedProduct.price - (selectedProduct.price * (newCust.discountPercentage || 0) / 100)) - (newCust.downPayment || 0)).toFixed(2) : 0} ج
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">الإجمالي بعد المقدم:</span>
                        <span className="font-bold text-xl text-gray-800">
                          {selectedProduct ? (((selectedProduct.price - (selectedProduct.price * (newCust.discountPercentage || 0) / 100)) - (newCust.downPayment || 0)) * (1 + (newCust.installmentPercentage || 0) / 100)).toFixed(2) : 0} ج
                        </span>
                      </div>
                      {!newCust.paidRemaining && (
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-gray-600">الدفعة الشهرية:</span>
                          <span className="font-bold text-2xl text-indigo-600">
                            {selectedProduct ? ((((selectedProduct.price - (selectedProduct.price * (newCust.discountPercentage || 0) / 100)) - (newCust.downPayment || 0)) * (1 + (newCust.installmentPercentage || 0) / 100)) / (newCust.months || 1)).toFixed(2) : 0} ج
                          </span>
                        </div>
                      )}

                      <button 
                        onClick={handleCreateContract}
                        className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
                      >
                        <Check size={20} />
                        حفظ التعاقد وإنشاء الجدول
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
