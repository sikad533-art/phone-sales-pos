"use client";

import Layout from '@/components/Layout';
import { ShoppingCart, RotateCcw, CreditCard, Store, FileText, Package } from 'lucide-react';
import { useAppContext } from '@/lib/store';
import Link from 'next/link';

export default function Home() {
  const { state } = useAppContext();
  const p = state.currentUser?.permissions;

  const today = new Date().toISOString().split('T')[0];
  const todaySales = state.invoices
    .filter(i => i.type === 'sale' && i.date?.startsWith(today))
    .reduce((s, i) => s + i.total, 0);
  const todayReturns = state.invoices
    .filter(i => i.type === 'return' && i.date?.startsWith(today))
    .reduce((s, i) => s + i.total, 0);

  const stats = [
    { label: 'إجمالي الأصناف', value: state.products.length, icon: Package, color: 'indigo' },
    { label: 'مبيعات اليوم', value: todaySales, icon: ShoppingCart, color: 'emerald', currency: true },
    { label: 'مرتجعات اليوم', value: todayReturns, icon: RotateCcw, color: 'red', currency: true },
    { label: 'صافي المبيعات', value: todaySales - todayReturns, icon: FileText, color: 'orange', currency: true },
  ];

  const quickActions = [
    { label: 'الكاشير', path: '/cashier', icon: ShoppingCart, show: p?.movement_cashier, color: 'indigo' },
    { label: 'مرتجع كاشير', path: '/cashier-return', icon: RotateCcw, show: p?.movement_cashierReturn, color: 'red' },
    { label: 'مبيعات عربون', path: '/installments', icon: CreditCard, show: p?.movement_downPayment, color: 'emerald' },
    { label: 'المخزن', path: '/inventory', icon: Package, show: p?.inventory_quantities || p?.inventory_add, color: 'amber' },
    { label: 'كشف حساب نقدي', path: '/reports/cash', icon: FileText, show: true, color: 'slate' },
    { label: 'الإعدادات', path: '/settings', icon: Store, show: p?.settings_system, color: 'gray' },
  ].filter(a => a.show);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-black text-indigo-900 mb-2">مرحباً بك في سيستم فون</h1>
          <p className="text-gray-500">نظام إدارة المبيعات والمخزون</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(stat => {
            const Icon = stat.icon;
            const colorMap: Record<string, { bg: string, text: string, glow: string }> = {
              indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', glow: 'shadow-indigo-100' },
              emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', glow: 'shadow-emerald-100' },
              red: { bg: 'bg-red-50', text: 'text-red-600', glow: 'shadow-red-100' },
              orange: { bg: 'bg-orange-50', text: 'text-orange-600', glow: 'shadow-orange-100' },
            };
            const c = colorMap[stat.color] || colorMap.indigo;
            return (
              <div key={stat.label} className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all ${c.glow}`}>
                <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon size={20} className={c.text} />
                </div>
                <div className={`text-2xl font-black ${c.text}`}>
                  {stat.currency ? `${stat.value.toLocaleString()} ج` : stat.value}
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">⚡ وصول سريع</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map(action => {
            const Icon = action.icon;
            const colorMap: Record<string, { bg: string, text: string, border: string }> = {
              indigo: { bg: 'hover:bg-indigo-50', text: 'text-indigo-600', border: 'hover:border-indigo-200' },
              red: { bg: 'hover:bg-red-50', text: 'text-red-600', border: 'hover:border-red-200' },
              emerald: { bg: 'hover:bg-emerald-50', text: 'text-emerald-600', border: 'hover:border-emerald-200' },
              amber: { bg: 'hover:bg-amber-50', text: 'text-amber-600', border: 'hover:border-amber-200' },
              slate: { bg: 'hover:bg-slate-50', text: 'text-slate-600', border: 'hover:border-slate-200' },
              gray: { bg: 'hover:bg-gray-50', text: 'text-gray-600', border: 'hover:border-gray-200' },
            };
            const c = colorMap[action.color] || colorMap.indigo;
            return (
              <Link key={action.path} href={action.path}
                className={`flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-xl p-6 shadow-sm transition-all ${c.bg} ${c.border} hover:shadow-md`}
              >
                <Icon size={28} className={c.text} />
                <span className="text-sm font-bold text-gray-700">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
