'use client';

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Package,
  Bike,
  DoorOpen,
  CheckCircle2,
  MapPin,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type Stage = 0 | 1 | 2;

const STAGES = [
  { id: 0, icon: Package, label: 'Pharmacy Packing...', sublabel: 'Your meds are being prepared', color: 'emerald' },
  { id: 1, icon: Bike, label: 'Rider Picked Up...', sublabel: 'Rider has collected your order', color: 'emerald' },
  { id: 2, icon: DoorOpen, label: 'En Route (10 mins)...', sublabel: "Almost at your doorstep", color: 'emerald' },
];

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, [seconds]);
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return { mins, secs, seconds };
}

export default function Fulfillment() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    pharmacyName?: string;
    medicineName?: string;
    pharmacyLocation?: string;
    paymentMethod?: string;
  } | null;

  const pharmacyName = state?.pharmacyName ?? 'Fiolu Pharmacy Ltd';
  const medicineName = state?.medicineName ?? 'Insulin (Mixtard 30/70)';
  const pharmacyLocation = state?.pharmacyLocation ?? 'GRA';

  const { mins, secs, seconds } = useCountdown(15 * 60);
  const [currentStage, setCurrentStage] = useState<Stage>(0);

  // Auto-advance stages for demo vividness
  useEffect(() => {
    const t1 = setTimeout(() => setCurrentStage(1), 4000);
    const t2 = setTimeout(() => setCurrentStage(2), 9000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const urgencyColor = seconds <= 120 ? 'text-red-500' : 'text-slate-900';

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="min-h-screen bg-white font-sans text-slate-900"
    >
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/checkout" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-semibold text-sm">Order Details</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Activity size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">Pharma-E</span>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-xl shadow-emerald-200">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Confirmed!</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Order On Its Way</h1>
          <p className="mt-2 text-slate-500">Your verified medication is being dispatched right now.</p>
        </motion.div>

        {/* Countdown + Rider Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-5 sm:grid-cols-2"
        >
          {/* Countdown */}
          <div className="rounded-3xl bg-slate-50 border border-slate-100 p-8 text-center shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Estimated Arrival</p>
            <div className={`text-6xl font-black tracking-tight tabular-nums transition-colors ${urgencyColor}`}>
              {mins}:{secs}
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-500">minutes remaining</p>
            {/* Thin progress bar */}
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="h-full rounded-full bg-emerald-500"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.max(0, 100 - (seconds / (15 * 60)) * 100)}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>
          </div>

          {/* Rider Status */}
          <div className="flex flex-col justify-center rounded-3xl bg-emerald-600 border border-emerald-500 p-8 text-white shadow-xl shadow-emerald-200">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-4">Rider Status</p>
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-white" />
              </span>
              <span className="text-xl font-black">Rider Assigned</span>
            </div>
            <p className="text-sm text-emerald-100">En route from {pharmacyName}</p>
            <div className="mt-5 flex items-center gap-2">
              <MapPin size={14} className="text-emerald-300" />
              <span className="text-xs text-emerald-200">{pharmacyLocation} → Your Location</span>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar: Multi-stage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm"
        >
          <h2 className="text-base font-bold text-slate-900 mb-8">Order Progress</h2>

          {/* Track Line */}
          <div className="relative">
            {/* Background line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-100 z-0" />
            {/* Animated fill line */}
            <motion.div
              className="absolute top-6 left-6 h-0.5 bg-emerald-500 z-0"
              style={{ right: currentStage === 0 ? '67%' : currentStage === 1 ? '33%' : '6px' }}
              animate={{ right: currentStage === 0 ? '67%' : currentStage === 1 ? '33%' : '6px' }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />

            {/* Stage Nodes */}
            <div className="relative z-10 flex justify-between">
              {STAGES.map((stage) => {
                const Icon = stage.icon;
                const isDone = currentStage > stage.id;
                const isCurrent = currentStage === stage.id;

                return (
                  <div key={stage.id} className="flex flex-col items-center gap-3" style={{ width: '33%' }}>
                    <motion.div
                      animate={{
                        scale: isCurrent ? [1, 1.12, 1] : 1,
                        backgroundColor: isDone ? '#059669' : isCurrent ? '#059669' : '#f1f5f9',
                        color: isDone || isCurrent ? '#ffffff' : '#94a3b8',
                        boxShadow: isCurrent
                          ? '0 0 0 8px rgba(5,150,105,0.15), 0 4px 14px rgba(5,150,105,0.3)'
                          : 'none',
                      }}
                      transition={{ duration: 0.5, repeat: isCurrent ? Infinity : 0, repeatDelay: 1 }}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    >
                      {isDone ? <CheckCircle2 size={22} /> : <Icon size={22} />}
                    </motion.div>

                    <div className="text-center">
                      <p className={`text-xs font-bold leading-tight ${
                        isDone || isCurrent ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {stage.label}
                      </p>
                      <AnimatePresence>
                        {isCurrent && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-1 text-xs text-emerald-600 font-semibold"
                          >
                            {stage.sublabel}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isDone
                          ? 'bg-slate-100 text-slate-500'
                          : isCurrent
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-50 text-slate-400'
                      }`}>
                        {isDone ? 'Done' : isCurrent ? 'Current' : stage.id === STAGES.length - 1 ? 'Target' : 'Next'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Order Info Footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-slate-50 border border-slate-100 px-6 py-5"
        >
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-slate-400 mr-1">Medicine:</span>
              <span className="font-bold text-slate-900">{medicineName}</span>
            </div>
            <div>
              <span className="text-slate-400 mr-1">Source:</span>
              <span className="font-bold text-slate-900">{pharmacyName}</span>
            </div>
            <div>
              <span className="text-slate-400 mr-1">Status:</span>
              <span className="font-bold text-emerald-600">Dispatched</span>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Link
            to="/search"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
          >
            <ArrowLeft size={16} /> Back to Med-Search
          </Link>
        </motion.div>

      </div>
    </motion.div>
  );
}
