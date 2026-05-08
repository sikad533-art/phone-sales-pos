"use client";

import Layout from '@/components/Layout';
import { Smartphone, Store, ShieldCheck } from 'lucide-react';
import { useAppContext } from '@/lib/store';
import { motion } from 'motion/react';

export default function Home() {
  const { state } = useAppContext();
  
  return (
    <Layout>
      <div className="h-full flex flex-col items-center justify-center -mt-10 overflow-hidden">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="relative mb-12"
        >
          {/* Main Icon Background Glow */}
          <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-20 rounded-full scale-150"></div>
          
          <div className="relative bg-white p-10 rounded-3xl shadow-2xl shadow-indigo-100 border border-indigo-50 flex items-center justify-center z-10">
            <Smartphone className="text-indigo-600 w-24 h-24" strokeWidth={1.5} />
            
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -bottom-5 -right-5 bg-emerald-500 text-white p-3.5 rounded-2xl shadow-xl border-4 border-gray-50"
            >
              <ShieldCheck size={28} />
            </motion.div>
            
            <motion.div 
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="absolute -top-5 -left-5 bg-blue-500 text-white p-3.5 rounded-2xl shadow-xl border-4 border-gray-50"
            >
              <Store size={28} />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.1, duration: 0.5 }}
           className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-indigo-950 via-indigo-800 to-indigo-600 mb-6 drop-shadow-sm leading-tight p-2">
            مرحباً بك في سيستم فون
          </h1>
          
          <p className="text-xl text-gray-500 max-w-lg mx-auto leading-relaxed">
            نظام متكامل لإدارة المبيعات والمخازن<br/>والحسابات بكل سهولة وأمان.
          </p>
          
          <div className="mt-8 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-6 py-2.5 rounded-full font-medium border border-indigo-100 shadow-sm">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             مرحباً {state.currentUser?.name}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
