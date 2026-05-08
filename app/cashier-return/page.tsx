"use client";

import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import { useAppContext, Product, InvoiceItem, Invoice } from '@/lib/store';
import { Search, Plus, Trash2, CheckCircle, RotateCcw, Save, FilePlus } from 'lucide-react';

export default function CashierReturn() {
  const { state, addInvoice } = useAppContext();
  
  // Invoice state
  const [invoiceId, setInvoiceId] = useState('');
  const [selectedItems, setSelectedItems] = useState<(InvoiceItem & { product: Product })[]>([]);
  const [returnInvoiceId, setReturnInvoiceId] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Manual entry / Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [qtyInput, setQtyInput] = useState<number>(1);
  const [priceInput, setPriceInput] = useState<number>(0);

  useEffect(() => {
    generateNewInvoiceId();
  }, []);

  const generateNewInvoiceId = () => {
    setInvoiceId(Math.random().toString(36).substr(2, 9).toUpperCase());
  };

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    const found = state.products.find(p => p.code === val || p.name === val);
    if (found) {
      setCurrentProduct(found);
      setPriceInput(found.price);
      setQtyInput(1);
    } else {
      setCurrentProduct(null);
      setPriceInput(0);
      setQtyInput(1);
    }
  };

  const handleAddItem = () => {
    if (!currentProduct) {
      alert('الرجاء اختيار صنف صحيح');
      return;
    }
    
    // Add to items
    const existing = selectedItems.find(i => i.productId === currentProduct.id);
    if (existing) {
      setSelectedItems(items => items.map(i => 
        i.productId === currentProduct.id 
          ? { ...i, quantity: i.quantity + qtyInput, total: (i.quantity + qtyInput) * priceInput } 
          : i
      ));
    } else {
      setSelectedItems([...selectedItems, {
        productId: currentProduct.id,
        product: currentProduct,
        quantity: qtyInput,
        price: priceInput,
        total: priceInput * qtyInput
      }]);
    }

    // Reset entry form
    setSearchTerm('');
    setCurrentProduct(null);
    setQtyInput(1);
    setPriceInput(0);
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(items => items.filter(i => i.productId !== productId));
  };

  const totalAmount = selectedItems.reduce((acc, item) => acc + item.total, 0);

  const resetForm = () => {
    setSelectedItems([]);
    setSearchTerm('');
    setCurrentProduct(null);
    setReturnInvoiceId('');
    generateNewInvoiceId();
  };

  const handleCompleteReturn = () => {
    if (selectedItems.length === 0) return;
    if (!returnInvoiceId) {
      alert('برجاء كتابة رقم فاتورة المرتجع');
      return;
    }

    const newInvoice: Invoice = {
      id: invoiceId,
      type: 'return',
      date: new Date().toISOString(),
      items: selectedItems.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, total: i.total })),
      total: totalAmount,
      paymentMethod: 'cash', // Force cash for returns
      returnInvoiceId,
    };

    addInvoice(newInvoice);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      resetForm();
    }, 1500);
  };

  // Dropdown suggestions for search
  const suggestions = searchTerm && !currentProduct
    ? state.products.filter(p => p.name.includes(searchTerm) || p.code.includes(searchTerm))
    : [];

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-sm border border-red-200 h-full flex flex-col overflow-hidden max-w-5xl mx-auto">
        
        {/* Header / Invoice Number */}
        <div className="p-4 border-b border-red-100 flex justify-between items-center bg-red-50">
          <h2 className="font-bold text-xl text-red-900 flex items-center gap-2">
            <RotateCcw size={24} />
            شاشة مرتجع الكاشير
          </h2>
          <div className="bg-white px-6 py-2 rounded-lg border border-red-300 font-mono text-lg font-bold flex items-center gap-2 text-red-900">
            <span className="text-red-500 text-sm">رقم فاتورة الإرجاع:</span> {invoiceId}
          </div>
        </div>

        {/* Input Form */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end relative">
            <div className="md:col-span-2 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">كود أو اسم الصنف (بحث)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="ابحث هنا..."
                  className="w-full border-gray-300 rounded-lg p-2.5 pl-10 border focus:ring-red-500 focus:border-red-500"
                />
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
              
              {/* Dropdown Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-lg max-h-48 overflow-auto z-10">
                  {suggestions.map(p => (
                    <div 
                      key={p.id} 
                      className="p-3 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      onClick={() => {
                        setSearchTerm(p.name);
                        setCurrentProduct(p);
                        setPriceInput(p.price);
                        setQtyInput(1);
                      }}
                    >
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-gray-500">متاح للمبيعات: {p.quantity}</div>
                      </div>
                      <div className="font-mono text-sm">{p.code}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">سعر الإرجاع</label>
              <input 
                type="number" 
                value={priceInput || ''}
                onChange={(e) => setPriceInput(parseFloat(e.target.value) || 0)}
                className="w-full border-gray-300 rounded-lg p-2.5 border bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الكمية المسترجعة</label>
              <input 
                type="number" 
                min="1"
                value={qtyInput}
                onChange={(e) => setQtyInput(parseInt(e.target.value) || 1)}
                className="w-full border-gray-300 rounded-lg p-2.5 border"
              />
            </div>

            <div>
              <button 
                onClick={handleAddItem}
                disabled={!currentProduct}
                className="w-full bg-red-100 text-red-700 hover:bg-red-200 p-2.5 rounded-lg font-bold flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <Plus size={20} /> إضافة للمرتجع
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Items Area */}
        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          <h3 className="font-bold text-gray-700 mb-3 text-sm">شاشة أصناف المرتجع</h3>
          <div className="bg-white border text-right border-gray-200 rounded-xl overflow-hidden min-h-[200px]">
             <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm border-b">
                  <th className="p-3 font-medium border-l border-gray-200 w-24">كود الصنف</th>
                  <th className="p-3 font-medium border-l border-gray-200">اسم الصنف</th>
                  <th className="p-3 font-medium border-l border-gray-200 w-24">الكمية</th>
                  <th className="p-3 font-medium border-l border-gray-200 w-28">السعر</th>
                  <th className="p-3 font-medium border-l border-gray-200 w-32">الإجمالي</th>
                  <th className="p-3 font-medium w-16">حذف</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item) => (
                  <tr key={item.productId} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3 font-mono text-gray-600 border-l border-gray-100">{item.product.code}</td>
                    <td className="p-3 font-bold border-l border-gray-100">{item.product.name}</td>
                    <td className="p-3 font-bold border-l border-gray-100">{item.quantity}</td>
                    <td className="p-3 border-l border-gray-100">{item.price.toLocaleString()}</td>
                    <td className="p-3 font-bold text-red-600 border-l border-gray-100">{item.total.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {selectedItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-400">لا يوجد أصناف في المرتجع</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer: Totals and Payment */}
        <div className="p-6 border-t border-gray-200 bg-white">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <div className="text-sm text-red-800 mb-1 font-medium">إجمالي المرتجع (يدفع كاش من الخزينة)</div>
                <div className="text-4xl font-black text-red-600">{totalAmount.toLocaleString()} <span className="text-xl font-bold">ج.م</span></div>
              </div>

               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم فاتورة المرتجع</label>
                    <input 
                      type="text"
                      value={returnInvoiceId}
                      onChange={(e) => setReturnInvoiceId(e.target.value)}
                      placeholder="أدخل رقم فاتورة المرتجع..."
                      className="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-red-500 focus:border-red-500 font-mono"
                    />
                  </div>
                  <div>
                     <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 w-full border border-gray-200">
                       <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                       طريقة السداد: نقدي (ثابت للتسميع في كشف حساب النقدية)
                     </span>
                  </div>
              </div>

           </div>

           <div className="flex gap-4 mt-6">
              <button 
                onClick={resetForm}
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 p-4 rounded-xl font-bold text-lg transition flex justify-center items-center gap-2 border border-gray-300"
              >
                <FilePlus size={24} /> تفريغ
              </button>
              <button 
                onClick={handleCompleteReturn}
                disabled={selectedItems.length === 0}
                className="flex-[2] bg-red-600 text-white hover:bg-red-700 p-4 rounded-xl font-bold text-xl transition flex justify-center items-center gap-2 disabled:opacity-50 shadow-md"
              >
                {isSuccess ? <><CheckCircle size={28}/> تم حفظ المرتجع بنجاح</> : <><Save size={28}/> حفظ الفاتورة</>}
              </button>
           </div>
        </div>

      </div>
    </Layout>
  );
}

