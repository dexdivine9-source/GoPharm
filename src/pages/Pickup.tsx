'use client';

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowLeft,
  QrCode,
  Clock,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, [seconds]);
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return { hours, mins, secs, seconds };
}

// Minimal SVG QR code pattern (purely visual for demo)
function QRDisplay({ size = 200 }: { size?: number }) {
  const cell = size / 21;
  // Minimal finder pattern + data cells (visual demo, not real QR)
  const pattern: number[] = [
    1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,
    1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1,
    1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,
    1,0,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,1,0,1,
    1,0,1,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,1,0,1,
    1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,
    1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,
    1,1,0,1,0,1,1,1,1,0,1,1,0,1,1,0,1,1,0,1,0,
    0,1,1,0,1,0,0,0,1,1,1,0,0,0,0,1,0,0,1,1,0,
    1,0,1,1,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,0,1,
    0,1,0,0,1,0,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0,
    1,1,1,0,1,1,1,0,1,0,0,0,1,0,1,0,1,1,1,0,1,
    0,0,0,0,0,0,0,0,1,1,0,1,0,1,0,0,0,0,1,0,0,
    1,1,1,1,1,1,1,0,0,0,1,0,1,0,1,0,1,1,0,1,0,
    1,0,0,0,0,0,1,0,1,0,0,1,0,0,0,1,0,0,1,0,0,
    1,0,1,1,1,0,1,0,0,1,0,0,1,0,0,0,1,0,1,1,0,
    1,0,1,1,1,0,1,1,0,0,1,0,0,1,0,1,0,1,0,0,1,
    1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,
    1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,1,0,0,0,
    1,1,1,1,1,1,1,0,1,1,0,1,0,1,1,0,0,1,0,0,1,
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="white" />
      {pattern.map((v, i) => {
        const col = i % 21;
        const row = Math.floor(i / 21);
        return v ? (
          <rect
            key={i}
            x={col * cell}
            y={row * cell}
            width={cell}
            height={cell}
            fill="#0f172a"
          />
        ) : null;
      })}
    </svg>
  );
}

export default function Pickup() {
  const location = useLocation();
  const state = location.state as {
    pharmacyName?: string;
    medicineName?: string;
  } | null;

  const pharmacyName = state?.pharmacyName ?? 'Fiolu Pharmacy Ltd';
  const medicineName = state?.medicineName ?? 'Insulin (Mixtard 30/70)';

  const { hours, mins, secs, seconds } = useCountdown(2 * 60 * 60); // 2 hours
  const isExpiring = seconds <= 600; // last 10 mins

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
          <Link to="/search" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-semibold text-sm">Back to Search</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Activity size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">Pharma-E</span>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 text-center space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Pre-order QR</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Your Pickup Code
          </h1>
          <p className="mt-3 text-slate-500 leading-relaxed max-w-sm mx-auto">
            Scan this at the{' '}
            <span className="font-bold text-slate-800">Pharma-E Express Counter</span>
            {' '}at{' '}
            <span className="font-bold text-slate-800">{pharmacyName}</span>
            {' '}for Instant Collection.
          </p>
        </motion.div>

        {/* QR Code Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="relative mx-auto w-fit"
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/10 blur-2xl scale-110" />

          <div className="relative rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-2xl shadow-slate-200">
            {/* Pharma-E badge on QR */}
            <div className="mb-4 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2">
              <Sparkles size={14} className="text-emerald-200" />
              <span className="text-xs font-black text-white tracking-wider">PHARMA-E EXPRESS</span>
              <Sparkles size={14} className="text-emerald-200" />
            </div>

            {/* QR Code */}
            <div className="rounded-xl overflow-hidden border border-slate-100 p-2 bg-white">
              <QRDisplay size={220} />
            </div>

            {/* Scan instruction */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <QrCode size={16} className="text-emerald-500" />
              <span className="font-semibold">Show this at the pharmacy counter</span>
            </div>
          </div>
        </motion.div>

        {/* Reservation Expiry Timer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={`rounded-2xl border px-6 py-5 transition-colors ${
            isExpiring
              ? 'border-red-200 bg-red-50'
              : 'border-amber-200 bg-amber-50'
          }`}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Clock size={18} className={isExpiring ? 'text-red-500' : 'text-amber-600'} />
            <p className={`text-sm font-bold ${isExpiring ? 'text-red-700' : 'text-amber-800'}`}>
              Reservation Expires In
            </p>
          </div>
          <div className={`text-4xl font-black tabular-nums tracking-tight ${isExpiring ? 'text-red-600' : 'text-amber-700'}`}>
            {hours}:{mins}:{secs}
          </div>
          <p className={`mt-1 text-xs ${isExpiring ? 'text-red-500' : 'text-amber-600'}`}>
            {isExpiring ? '⚠️ Hurry! Your slot is about to expire.' : 'Your medication is reserved at the pharmacy.'}
          </p>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-5 text-left space-y-3"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Order Details</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Medicine</span>
            <span className="font-bold text-slate-900">{medicineName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Pickup At</span>
            <div className="flex items-center gap-1 font-bold text-slate-900">
              <MapPin size={13} className="text-emerald-500" />
              {pharmacyName}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Status</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={12} /> Ready for Pickup
            </span>
          </div>
        </motion.div>

        {/* Verified Assurance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex items-center justify-center gap-2.5 text-sm text-slate-500"
        >
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span>
            <span className="font-semibold text-slate-700">Pharma-E Verified</span> — QR is single-use and tamper-proof
          </span>
        </motion.div>

      </div>
    </motion.div>
  );
}
