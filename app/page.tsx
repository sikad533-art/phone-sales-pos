"use client";

import Layout from '@/components/Layout';
import { Smartphone, ShieldCheck, Store } from 'lucide-react';
import { useAppContext } from '@/lib/store';
import { motion } from 'motion/react';

export default function Home() {
  const { state } = useAppContext();
  const user = state.currentUser;

  return (
    <Layout>
      <div className="h-full flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
          className="relative mb-10"
        >
          <div className="absolute inset-0 bg-indigo-500 blur-[100px] opacity-15 rounded-full scale-150" />

          <div className="relative bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50 flex items-center justify-center">
            <Smartphone className="text-indigo-600 w-20 h-20" strokeWidth={1.5} />

            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="absolute -bottom-4 -right-4 bg-emerald-500 text-white p-3 rounded-2xl shadow-lg"
            >
              <ShieldCheck size={22} />
            </motion.div>

            <motion.div
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -top-4 -left-4 bg-indigo-500 text-white p-3 rounded-2xl shadow-lg"
            >
              <Store size={22} />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-indigo-950 via-indigo-800 to-indigo-600 mb-4">
            مرحباً بك في سيستم فون
          </h1>

          <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
            نظام متكامل لإدارة المبيعات والمخازن والحسابات بكل سهولة وأمان.
          </p>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-2 rounded-full font-medium border border-indigo-100 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            مرحباً {user?.name}
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
