"use client";

import Layout from '@/components/Layout';
import { useState } from 'react';
import { useAppContext, User, Permissions } from '@/lib/store';
import { Settings as SettingsIcon, Users, UserPlus, Shield, Check, Trash2, Edit } from 'lucide-react';

const emptyPermissions: Permissions = {
  movement_cashier: false,
  movement_cashierReturn: false,
  movement_downPayment: false,
  movement_downPaymentReturn: false,

  inventory_quantities: false,
  inventory_card: false,
  inventory_add: false,

  installments_addCustomer: false,
  installments_pay: false,
  installments_late: false,

  settings_system: false,
};

export default function SettingsPage() {
  const { state, addUser, updateUser, deleteUser } = useAppContext();
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [permissions, setPermissions] = useState<Permissions>(emptyPermissions);

  if (!state.currentUser?.permissions.settings_system) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full text-gray-500">
          ليس لديك صلاحية للدخول إلى هذه الصفحة.
        </div>
      </Layout>
    );
  }

  const handleOpenForm = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setName(user.name);
      setCode(user.code);
      setPermissions(user.permissions);
    } else {
      setEditingUser(null);
      setName('');
      setCode('');
      setPermissions(emptyPermissions);
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!name || code.length !== 2) {
      alert("برجاء إدخال اسم صحيح وكود من رقمين");
      return;
    }
    
    if (!editingUser && state.users.find(u => u.code === code)) {
      alert("هذا الكود مستخدم بالفعل");
      return;
    }

    if (editingUser) {
      updateUser({ ...editingUser, name, code, permissions });
    } else {
      addUser({
        id: Math.random().toString(36).substr(2, 9),
        name,
        code,
        permissions
      });
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string, code: string) => {
    if (code === '90' || id === state.currentUser?.id) {
      alert("لا يمكن حذف مدير النظام الأساسي أو حسابك الحالي");
      return;
    }
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      deleteUser(id);
    }
  };

  const togglePermission = (key: keyof Permissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const permCheckbox = (label: string, key: keyof Permissions) => (
    <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <input 
        type="checkbox" 
        checked={permissions[key]} 
        onChange={() => togglePermission(key)}
        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
      />
      <span className="font-medium text-gray-700">{label}</span>
    </label>
  );

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full max-w-5xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center text-gray-900">
          <h2 className="font-bold text-xl flex items-center gap-2">
            <SettingsIcon size={24} className="text-gray-600"/>
            إعدادات النظام والصلاحيات
          </h2>
          {!isFormOpen && (
            <button 
              onClick={() => handleOpenForm()}
              className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition text-sm"
            >
              <UserPlus size={18} /> إضافة مستخدم جديد
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
          
          {isFormOpen ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-4xl mx-auto animate-in fade-in zoom-in-95">
              <h3 className="text-lg font-bold text-indigo-900 mb-6 border-b pb-3 flex items-center gap-2">
                <Shield size={20} />
                {editingUser ? 'تعديل بيانات وصلاحيات المستخدم' : 'مستخدم جديد'}
              </h3>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                  <input 
                    type="text" 
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="مثال: أحمد كاشير"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">كود الدخول (رقمين فقط)</label>
                  <input 
                    type="text" maxLength={2}
                    value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-indigo-500 focus:border-indigo-500 font-mono text-center tracking-widest text-lg"
                    placeholder="12"
                  />
                </div>
              </div>

              <h4 className="font-bold text-gray-800 mb-4">تحديد الصلاحيات</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Movement */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">الحركة</div>
                  {permCheckbox('كاشير', 'movement_cashier')}
                  {permCheckbox('مرتجع كاشير', 'movement_cashierReturn')}
                  {permCheckbox('عربون', 'movement_downPayment')}
                  {permCheckbox('مرتجع عربون', 'movement_downPaymentReturn')}
                </div>

                {/* Inventory */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">المخزن</div>
                  {permCheckbox('كميات الأصناف', 'inventory_quantities')}
                  {permCheckbox('كارت الصنف', 'inventory_card')}
                  {permCheckbox('إضافة صنف جديد', 'inventory_add')}
                </div>

                {/* Installments */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">الأقساط</div>
                  {permCheckbox('إضافة عميل', 'installments_addCustomer')}
                  {permCheckbox('تسديد قسط', 'installments_pay')}
                  {permCheckbox('الأقساط المتأخرة', 'installments_late')}
                </div>

                {/* System */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">أخرى (للمدير فقط)</div>
                  {permCheckbox('إعدادات البرنامج', 'settings_system')}
                </div>

              </div>

              <div className="mt-8 pt-4 border-t flex justify-end gap-3">
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
                >
                  <Check size={18}/> حفظ البيانات
                </button>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(state.users || []).map(user => (
                <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Users size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{user.name}</h3>
                        <div className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">كود: {user.code}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-10">
                    {user.permissions.settings_system ? 'مدير نظام (كافة الصلاحيات)' : 'مستخدم محدود الصلاحيات'}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handleOpenForm(user)}
                      className="flex-1 flex justify-center items-center gap-2 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-medium text-sm"
                    >
                      <Edit size={16} /> تعديل
                    </button>
                    {user.code !== '90' && user.id !== state.currentUser?.id && (
                      <button 
                        onClick={() => handleDelete(user.id, user.code)}
                        className="flex-1 flex justify-center items-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-sm"
                      >
                        <Trash2 size={16} /> حذف
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
