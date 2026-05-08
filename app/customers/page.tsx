"use client";

import Layout from '@/components/Layout';
import { useState } from 'react';
import { useAppContext, Customer } from '@/lib/store';
import { User, Phone, MapPin, FileDigit, ShieldCheck, Save } from 'lucide-react';

export default function Customers() {
  const { state, addCustomer } = useAppContext();
  const [form, setForm] = useState({
    name: '', phone: '', address: '', idCardNumber: '',
    areaType: 'inside' as 'inside' | 'outside',
    guarantor1Name: '', guarantor1Phone: '',
    guarantor2Name: '', guarantor2Phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) { alert('اسم العميل والتليفون إلزامي'); return; }
    const customer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      ...form,
      createdAt: new Date().toISOString(),
    };
    addCustomer(customer);
    alert('تم تسجيل العميل بنجاح ✅');
    setForm({ name: '', phone: '', address: '', idCardNumber: '', areaType: 'inside', guarantor1Name: '', guarantor1Phone: '', guarantor2Name: '', guarantor2Phone: '' });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
          <User size={24} /> تسجيل عميل جديد
        </h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border-gray-300 rounded-lg p-3 border focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم التليفون <span className="text-red-500">*</span></label>
              <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full border-gray-300 rounded-lg p-3 border focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
              <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                className="w-full border-gray-300 rounded-lg p-3 border focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم البطاقة</label>
              <input type="text" maxLength={14} value={form.idCardNumber} onChange={e => setForm({...form, idCardNumber: e.target.value})}
                className="w-full border-gray-300 rounded-lg p-3 border focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="area" checked={form.areaType === 'inside'} onChange={() => setForm({...form, areaType: 'inside'})} />
                داخل المنطقة
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="area" checked={form.areaType === 'outside'} onChange={() => setForm({...form, areaType: 'outside'})} />
                خارج المنطقة
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2"><ShieldCheck size={20} /> بيانات الضامن</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الضامن</label>
                <input type="text" value={form.guarantor1Name} onChange={e => setForm({...form, guarantor1Name: e.target.value})}
                  className="w-full border-gray-300 rounded-lg p-3 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تليفون الضامن</label>
                <input type="text" value={form.guarantor1Phone} onChange={e => setForm({...form, guarantor1Phone: e.target.value})}
                  className="w-full border-gray-300 rounded-lg p-3 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الضامن الثاني</label>
                <input type="text" value={form.guarantor2Name} onChange={e => setForm({...form, guarantor2Name: e.target.value})}
                  className="w-full border-gray-300 rounded-lg p-3 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تليفون الضامن الثاني</label>
                <input type="text" value={form.guarantor2Phone} onChange={e => setForm({...form, guarantor2Phone: e.target.value})}
                  className="w-full border-gray-300 rounded-lg p-3 border" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 text-lg">
            <Save size={22} /> حفظ بيانات العميل
          </button>
        </form>

        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><User size={20} /> العملاء المسجلين ({state.customers.length})</h3>
          {state.customers.length === 0 ? (
            <p className="text-gray-500 text-center py-8 bg-white rounded-xl border border-gray-200">لا يوجد عملاء مسجلين</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="p-3 font-bold">الاسم</th>
                    <th className="p-3 font-bold">التليفون</th>
                    <th className="p-3 font-bold">العنوان</th>
                    <th className="p-3 font-bold">الضامن</th>
                  </tr>
                </thead>
                <tbody>
                  {state.customers.map(c => (
                    <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium">{c.name}</td>
                      <td className="p-3">{c.phone}</td>
                      <td className="p-3 text-gray-500">{c.address || '-'}</td>
                      <td className="p-3 text-gray-500">{c.guarantor1Name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
