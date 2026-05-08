"use client";

import Layout from '@/components/Layout';
import { useAppContext, Product, InventoryDocument } from '@/lib/store';
import { useState } from 'react';
import { Search, Plus, Save, Package, ClipboardList, ListPlus, Boxes } from 'lucide-react';

export default function Inventory() {
  const { state, addProduct, addInventoryDocument } = useAppContext();
  const [activeTab, setActiveTab] = useState<'balances' | 'add_stock' | 'add_item'>('balances');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Item
  const [newItem, setNewItem] = useState<Partial<Product>>({ quantity: 0, price: 0, category: '' });

  // New Document
  const [docObj, setDocObj] = useState<Partial<InventoryDocument>>({ date: new Date().toISOString().split('T')[0], items: [] });
  const [currentDocItem, setCurrentDocItem] = useState({ productId: '', quantity: 1 });

  const categories = Array.from(new Set(state.products.map(p => p.category).filter(Boolean)));

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = state.products.filter(p => 
    p.name.includes(searchTerm) || p.code.includes(searchTerm) || p.category?.includes(searchTerm)
  );

  const handleSaveNewItem = () => {
    if (!newItem.name || !newItem.code || newItem.price === undefined || !newItem.category) {
      alert('يجب إدخال اسم وكود وسعر ومجموعة الصنف');
      return;
    }
    addProduct({
      id: Math.random().toString(36).substr(2, 9),
      code: newItem.code,
      name: newItem.name,
      category: newItem.category,
      price: newItem.price,
      quantity: newItem.quantity || 0
    });
    setNewItem({ quantity: 0, price: 0, category: '' });
    setActiveTab('balances');
  };

  const handleAddDocItem = () => {
    if (!currentDocItem.productId || currentDocItem.quantity <= 0) return;
    setDocObj(prev => ({
      ...prev,
      items: [...(prev.items || []), { ...currentDocItem }]
    }));
    setCurrentDocItem({ productId: '', quantity: 1 });
  };

  const handleRemoveDocItem = (index: number) => {
    setDocObj(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index)
    }));
  };

  const handleSaveDocument = () => {
    if (!docObj.documentNumber || !docObj.date || !docObj.items || docObj.items.length === 0) {
      alert('الرجاء إدخال رقم المستند والتاريخ وإضافة صنف واحد على الأقل');
      return;
    }
    
    addInventoryDocument({
      id: Math.random().toString(36).substr(2, 9),
      documentNumber: docObj.documentNumber,
      date: docObj.date,
      items: docObj.items
    });
    
    alert('تم حفظ إذن الإضافة بنجاح');
    setDocObj({ date: new Date().toISOString().split('T')[0], items: [] });
    setActiveTab('balances');
  };

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-wrap gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-900">
            <Package />
            إدارة المخزون
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('balances')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'balances' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <Boxes size={16} /> الأرصدة
            </button>
            <button 
              onClick={() => setActiveTab('add_stock')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'add_stock' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <ClipboardList size={16} /> إذن إضافة مخزون
            </button>
            <button 
              onClick={() => setActiveTab('add_item')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'add_item' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <ListPlus size={16} /> تعريف صنف جديد
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          {activeTab === 'add_item' && (
            <div className="mb-8 p-6 bg-indigo-50 border border-indigo-100 rounded-xl max-w-4xl mx-auto">
              <h3 className="font-semibold text-lg text-indigo-800 mb-4">بيانات الصنف الجديد</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">اسم الصنف</label>
                  <input type="text" className="w-full border p-2 rounded" 
                    value={newItem.name || ''} onChange={e=>setNewItem({...newItem, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الكود</label>
                  <input type="text" className="w-full border p-2 rounded" 
                    value={newItem.code || ''} onChange={e=>setNewItem({...newItem, code: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">المجموعة (Category)</label>
                  <input type="text" list="categories" className="w-full border p-2 rounded" 
                    placeholder="مثال: موبايلات، شواحن، الخ.."
                    value={newItem.category || ''} onChange={e=>setNewItem({...newItem, category: e.target.value})} 
                  />
                  <datalist id="categories">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">سعر البيع الافتراضي</label>
                  <input type="number" className="w-full border p-2 rounded" 
                    value={newItem.price || ''} onChange={e=>setNewItem({...newItem, price: parseFloat(e.target.value) || 0})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الكمية الافتتاحية</label>
                  <input type="number" className="w-full border p-2 rounded" 
                    value={newItem.quantity === 0 ? '' : newItem.quantity} onChange={e=>setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={handleSaveNewItem} className="px-6 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 flex items-center gap-2 font-medium shadow">
                  <Save size={16} /> حفظ الصنف
                </button>
              </div>
            </div>
          )}

          {activeTab === 'add_stock' && (
             <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm max-w-4xl mx-auto">
               <h3 className="font-semibold text-lg text-gray-800 mb-6">إذن إضافة مخزون جديد</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم المستند / الفاتورة</label>
                    <input type="text" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2" 
                      value={docObj.documentNumber || ''} onChange={e=>setDocObj({...docObj, documentNumber: e.target.value})} 
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                    <input type="date" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2" 
                      value={docObj.date || ''} onChange={e=>setDocObj({...docObj, date: e.target.value})} 
                    />
                 </div>
               </div>

               <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6 flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">الصنف</label>
                    <select className="w-full border-gray-300 rounded-lg border p-2" value={currentDocItem.productId} onChange={e => setCurrentDocItem({...currentDocItem, productId: e.target.value})}>
                      <option value="">-- اختر صنف --</option>
                      {categories.map(cat => (
                        <optgroup label={cat || 'بدون مجموعة'} key={cat}>
                          {state.products.filter(p => p.category === cat).map(p => (
                            <option key={p.id} value={p.id}>{p.name} - (كود: {p.code})</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                    <input type="number" min="1" className="w-full border-gray-300 rounded-lg border p-2" value={currentDocItem.quantity} onChange={e => setCurrentDocItem({...currentDocItem, quantity: parseInt(e.target.value) || 1})} />
                  </div>
                  <button onClick={handleAddDocItem} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-200 h-[42px]">
                    إضافة للصنف
                  </button>
               </div>

               {docObj.items && docObj.items.length > 0 && (
                 <table className="w-full text-right border-collapse border border-gray-200 mb-6 bg-white">
                   <thead>
                     <tr className="bg-gray-100 text-gray-700">
                       <th className="p-3 border-b border-gray-200">الصنف</th>
                       <th className="p-3 border-b border-gray-200 w-32">الكمية المدخلة</th>
                       <th className="p-3 border-b border-gray-200 w-24">إجراء</th>
                     </tr>
                   </thead>
                   <tbody>
                     {docObj.items.map((item, i) => {
                       const p = state.products.find(x => x.id === item.productId);
                       return (
                         <tr key={i} className="border-b border-gray-100">
                           <td className="p-3">{p?.name || 'صنف غير معروف'}</td>
                           <td className="p-3 font-semibold text-indigo-600">{item.quantity}</td>
                           <td className="p-3">
                              <button onClick={() => handleRemoveDocItem(i)} className="text-red-500 hover:text-red-700 text-sm">حذف</button>
                           </td>
                         </tr>
                       )
                     })}
                   </tbody>
                 </table>
               )}

               <div className="flex justify-end pt-4 border-t border-gray-200">
                 <button onClick={handleSaveDocument} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md flex items-center gap-2">
                   <Save size={18} /> ترحيل الإذن للمخزن
                 </button>
               </div>
             </div>
          )}

          {activeTab === 'balances' && (
            <>
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="ابحث بالاسم، الكود، أو المجموعة..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full border-gray-300 rounded-lg pl-10 pr-4 py-3 border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 max-w-md"
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-sm">
                      <th className="p-4 border-b border-gray-200 w-24">الكود</th>
                      <th className="p-4 border-b border-gray-200">المجموعة</th>
                      <th className="p-4 border-b border-gray-200">اسم الصنف</th>
                      <th className="p-4 border-b border-gray-200">سعر البيع (ج.م)</th>
                      <th className="p-4 border-b border-gray-200 w-32">الرصيد الحالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-mono text-gray-500 text-sm">{product.code}</td>
                        <td className="p-4 text-emerald-700 text-sm font-medium">
                          {product.category && <span className="bg-emerald-50 px-2 py-1 rounded-md">{product.category}</span>}
                        </td>
                        <td className="p-4 font-semibold text-gray-800">{product.name}</td>
                        <td className="p-4 font-medium text-indigo-600">{product.price.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm inline-block ${product.quantity > 5 ? 'bg-green-100 text-green-800' : product.quantity > 0 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                            {product.quantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-500">لا توجد أصناف تطابق بحثك</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>
      </div>
    </Layout>
  );
}
