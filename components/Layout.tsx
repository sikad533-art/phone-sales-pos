"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/lib/store';
import { 
  Home, 
  ShoppingCart, 
  RotateCcw, 
  CreditCard, 
  FileText, 
  Store, 
  ChevronDown,
  Settings,
  LogOut,
  User as UserIcon,
  Lock,
  Menu,
  X,
  Users,
  DollarSign
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { state, login, logout } = useAppContext();
  const pathname = usePathname();
  const [pinCode, setPinCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedDropdown, setMobileExpandedDropdown] = useState<string | null>(null);

  if (!state.currentUser) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
            <Lock size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تسجيل الدخول</h1>
          <p className="text-gray-500 mb-8">برجاء إدخال كود المستخدم المكون من رقمين</p>
          
          <input 
            type="password"
            maxLength={2}
            value={pinCode}
            onChange={e => {
              setPinCode(e.target.value);
              setLoginError('');
            }}
            placeholder="••"
            className="w-32 text-center text-4xl tracking-widest border-b-2 border-indigo-200 focus:border-indigo-600 outline-none p-2 mb-4 font-mono transition-colors"
          />
          {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
          
          <button 
            onClick={() => {
              if (!login(pinCode)) {
                setLoginError('كود المستخدم غير صحيح');
              }
            }}
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3 rounded-lg font-bold transition-all shadow-md mt-4"
          >
            دخول
          </button>
        </div>
      </div>
    );
  }

  const p = state.currentUser.permissions;

  const mainNavItems = [
    { name: 'الرئيسية', path: '/', icon: Home, show: true },
    { name: 'الكاشير', path: '/cashier', icon: ShoppingCart, show: p.movement_cashier },
    { name: 'مرتجع الكاشير', path: '/cashier-return', icon: RotateCcw, show: p.movement_cashierReturn },
    { name: 'مبيعات عربون (تقسيط)', path: '/installments', icon: CreditCard, show: p.movement_downPayment || p.installments_addCustomer || p.installments_pay },
    { name: 'تسجيل عميل', path: '/customers', icon: Users, show: p.installments_addCustomer },
    { name: 'السداد', path: '/payments', icon: DollarSign, show: p.installments_pay },
  ].filter(item => item.show);

  const showReports = true; // All can see these for now unless specified
  const showLateInstallments = p.installments_late;
  
  const showInventory = p.inventory_quantities || p.inventory_card || p.inventory_add;

  const toggleMobileDropdown = (name: string) => {
    if (mobileExpandedDropdown === name) setMobileExpandedDropdown(null);
    else setMobileExpandedDropdown(name);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-indigo-900 text-white shadow-md z-30 shrink-0 relative">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16 max-w-[1400px] mx-auto w-full">
          {/* Brand & Nav */}
          <div className="flex items-center gap-4 lg:gap-8 h-full">
            <button 
              className="lg:hidden p-1 text-indigo-200 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/" className="font-bold text-xl truncate text-indigo-50 flex items-center gap-2">
              <Store size={24} />
              <span className="hidden sm:inline">سيستم فون</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center h-full gap-2">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    href={item.path} 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium
                    ${isActive ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-white/10 hover:text-white'}`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}

              {/* Reports Dropdown */}
              {showReports && (
                <div className="relative h-full flex items-center group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-indigo-100 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium">
                    <FileText size={18} />
                    <span>التقارير</span>
                    <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform" />
                  </button>
                  
                  <div className="absolute top-[calc(100%-10px)] pt-2.5 right-0 w-56 hidden group-hover:block z-50">
                    <div className="bg-white text-gray-800 shadow-xl rounded-xl border border-gray-100 py-2 overflow-hidden animate-in slide-in-from-top-2 opacity-0 group-hover:opacity-100 fill-mode-forwards duration-200">
                      <Link href="/reports/cash" className="block px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-700 text-sm font-medium transition-colors">كشف حساب نقدي</Link>
                      <Link href="/reports/visa" className="block px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-700 text-sm font-medium transition-colors">كشف حساب فيزا/محافظ</Link>
                      <Link href="/reports/shift" className="block px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-700 text-sm font-medium transition-colors border-b border-gray-50">تقفيل وردية</Link>
                      <Link href="/reports/sales" className="block px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-700 text-sm font-medium transition-colors">تقرير المبيعات</Link>
                      <Link href="/reports/stagnant" className="block px-4 py-2.5 hover:bg-orange-50 hover:text-orange-700 text-sm font-medium transition-colors">تقرير الرواكد</Link>
                      {showLateInstallments && <Link href="/reports/late-installments" className="block px-4 py-2.5 hover:bg-red-50 hover:text-red-700 text-sm font-medium transition-colors border-t border-gray-50">الأقساط المتأخرة</Link>}
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Dropdown */}
              {showInventory && (
                <div className="relative h-full flex items-center group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-indigo-100 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium">
                    <Store size={18} />
                    <span>المخزن</span>
                    <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform" />
                  </button>
                  
                  <div className="absolute top-[calc(100%-10px)] pt-2.5 right-0 w-56 hidden group-hover:block z-50">
                    <div className="bg-white text-gray-800 shadow-xl rounded-xl border border-gray-100 py-2 overflow-hidden animate-in slide-in-from-top-2 opacity-0 group-hover:opacity-100 fill-mode-forwards duration-200">
                      {(p.inventory_quantities || p.inventory_add) && <Link href="/inventory" className="block px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-700 text-sm font-medium transition-colors flex justify-between items-center">
                        أرصدة الأصناف
                        {p.inventory_add && <span className="bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded font-bold">+</span>}
                      </Link>}
                      {p.inventory_card && <Link href="/inventory/card" className="block px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-700 text-sm font-medium transition-colors">كارت الصنف</Link>}
                    </div>
                  </div>
                </div>
              )}

              {/* Settings */}
              {p.settings_system && (
                <Link 
                  href="/settings" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium
                  ${pathname === '/settings' ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-white/10 hover:text-white'}`}
                >
                  <Settings size={18} />
                  <span>الإعدادات</span>
                </Link>
              )}
            </nav>
          </div>

          {/* User and Logout */}
          <div className="flex items-center gap-2 sm:gap-4 h-full">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-sm text-white">{state.currentUser.name}</div>
                <div className="text-xs text-indigo-300">متصل الآن</div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-800 flex items-center justify-center border-2 border-indigo-700 shadow-inner">
                <UserIcon size={18} className="text-indigo-200" />
              </div>
            </div>
            <div className="h-6 sm:h-8 w-px bg-indigo-800 mx-1 sm:mx-2"></div>
            <button 
              onClick={logout}
              className="text-indigo-200 hover:text-white hover:bg-red-500 hover:border-red-500 border border-transparent transition-all p-2 sm:px-3 sm:py-2 rounded-lg flex items-center gap-2 text-sm font-medium group"
              title="خروج"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-indigo-900 border-t border-indigo-800 shadow-xl overflow-y-auto max-h-[calc(100vh-64px)] z-40">
            <div className="flex flex-col py-2">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    href={item.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-6 py-3 transition-colors
                    ${isActive ? 'bg-indigo-800 text-white border-r-4 border-indigo-400' : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'}`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}

              {/* Reports Mobile */}
              {showReports && (
                <div className="border-t border-indigo-800/50 mt-1 pt-1">
                  <button 
                    onClick={() => toggleMobileDropdown('reports')}
                    className="w-full flex items-center justify-between px-6 py-3 text-indigo-100 hover:bg-indigo-800 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-3 font-medium">
                      <FileText size={20} />
                      <span>التقارير</span>
                    </div>
                    <ChevronDown size={18} className={`transition-transform duration-200 ${mobileExpandedDropdown === 'reports' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {mobileExpandedDropdown === 'reports' && (
                    <div className="bg-indigo-950/50 py-2">
                      <Link href="/reports/cash" onClick={() => setIsMobileMenuOpen(false)} className="block px-12 py-2.5 hover:bg-indigo-800 text-indigo-100 text-sm transition-colors">كشف حساب نقدي</Link>
                      <Link href="/reports/visa" onClick={() => setIsMobileMenuOpen(false)} className="block px-12 py-2.5 hover:bg-indigo-800 text-indigo-100 text-sm transition-colors">كشف حساب فيزا/محافظ</Link>
                      <Link href="/reports/shift" onClick={() => setIsMobileMenuOpen(false)} className="block px-12 py-2.5 hover:bg-indigo-800 text-indigo-100 text-sm transition-colors">تقفيل وردية</Link>
                      <Link href="/reports/sales" onClick={() => setIsMobileMenuOpen(false)} className="block px-12 py-2.5 hover:bg-indigo-800 text-indigo-100 text-sm transition-colors">تقرير المبيعات</Link>
                      <Link href="/reports/stagnant" onClick={() => setIsMobileMenuOpen(false)} className="block px-12 py-2.5 hover:bg-orange-800 text-orange-200 text-sm transition-colors">تقرير الرواكد</Link>
                      {showLateInstallments && <Link href="/reports/late-installments" onClick={() => setIsMobileMenuOpen(false)} className="block px-12 py-2.5 hover:bg-red-900/50 text-indigo-50 text-sm transition-colors">الأقساط المتأخرة</Link>}
                    </div>
                  )}
                </div>
              )}

              {/* Inventory Mobile */}
              {showInventory && (
                <div className="border-t border-indigo-800/50 mt-1 pt-1">
                  <button 
                    onClick={() => toggleMobileDropdown('inventory')}
                    className="w-full flex items-center justify-between px-6 py-3 text-indigo-100 hover:bg-indigo-800 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-3 font-medium">
                      <Store size={20} />
                      <span>المخزن</span>
                    </div>
                    <ChevronDown size={18} className={`transition-transform duration-200 ${mobileExpandedDropdown === 'inventory' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {mobileExpandedDropdown === 'inventory' && (
                    <div className="bg-indigo-950/50 py-2">
                      {(p.inventory_quantities || p.inventory_add) && (
                        <Link href="/inventory" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-12 py-2.5 hover:bg-indigo-800 text-indigo-100 text-sm transition-colors">
                          أرصدة الأصناف
                          {p.inventory_add && <span className="bg-indigo-800 text-indigo-200 text-xs px-1.5 py-0.5 rounded font-bold">+</span>}
                        </Link>
                      )}
                      {p.inventory_card && (
                        <Link href="/inventory/card" onClick={() => setIsMobileMenuOpen(false)} className="block px-12 py-2.5 hover:bg-indigo-800 text-indigo-100 text-sm transition-colors">كارت الصنف</Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Mobile */}
              {p.settings_system && (
                <div className="border-t border-indigo-800/50 mt-1 pt-1">
                  <Link 
                    href="/settings" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-6 py-3 transition-colors
                    ${pathname === '/settings' ? 'bg-indigo-800 text-white border-r-4 border-indigo-400' : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'}`}
                  >
                    <Settings size={20} />
                    <span className="font-medium">الإعدادات</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-1 overflow-auto p-4 sm:p-6 w-full max-w-[1400px] mx-auto relative z-10">
        {children}
      </main>
    </div>
  );
}
