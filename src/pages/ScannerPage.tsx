import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  ArrowLeft,
  ShieldCheck,
  ScanLine,
  History,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useNAFDACVerify } from '../hooks/useNAFDACVerify';
import { useSupabase } from '../lib/mock-db';
import CameraView from '../components/scanner/CameraView';
import VerificationModal from '../components/scanner/VerificationModal';

// ─── Demo hint badge ──────────────────────────────────────────────────────────
function DemoHint() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mx-4 mb-2 rounded-xl bg-amber-900/40 border border-amber-700/50 px-4 py-2.5 text-center"
    >
      <p className="text-amber-300 text-xs font-semibold">
        🧪 <span className="font-bold">Demo codes:</span>{' '}
        <code className="bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-200">BJ-2024-EMZ001</code>{' '}
        (authentic) ·{' '}
        <code className="bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-200">FAKE-0000-XXX01</code>{' '}
        (counterfeit) · or{' '}
        <code className="bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-200">pharmae-order-[ID]</code>
      </p>
    </motion.div>
  );
}

// ─── Scan history item ────────────────────────────────────────────────────────
function LogItem({ code, isAuthentic, ts }: { code: string; isAuthentic: boolean; ts: number; key?: React.Key }) {
  return (
    <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800 last:border-0">
      <div className="flex items-center gap-2">
        {isAuthentic ? (
          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
        ) : (
          <XCircle size={13} className="text-rose-400 shrink-0" />
        )}
        <span className="font-mono text-slate-300 truncate max-w-[160px]">{code}</span>
      </div>
      <span className="text-slate-500 shrink-0 ml-2">
        {new Date(ts).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ScannerPage() {
  const navigate = useNavigate();
  const { currentUser, verificationLogs } = useSupabase();

  const {
    scanState,
    result,
    errorMessage,
    onScanSuccess,
    startScanning,
    resetScanner,
  } = useNAFDACVerify();

  // Auto-start scanning when page loads
  useEffect(() => {
    startScanning();
  }, [startScanning]);

  const isActive = ['SCANNING', 'IDLE'].includes(scanState);
  const recentLogs = verificationLogs.slice(0, 5);

  const handleRequestRefund = () => {
    // Navigate back to dashboard with a refund flag
    navigate(currentUser?.role === 'pharmacy' ? '/portal' : '/dashboard', {
      state: { refundRequested: true },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-950 flex flex-col font-sans"
    >
      {/* ── Top Nav ── */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <Link
          to={currentUser?.role === 'pharmacy' ? '/portal' : '/dashboard'}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-semibold">Back</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-900">
            <Activity size={16} />
          </div>
          <span className="text-base font-black tracking-tighter text-white">Pharma-E</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
          <ScanLine size={14} />
          <span>Scanner</span>
        </div>
      </nav>

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-5 pb-4 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 rounded-full px-3 py-1 mb-3">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span className="text-emerald-400 text-xs font-bold tracking-wider uppercase">
            Scanner Core V1
          </span>
        </div>
        <h1 className="text-white font-black text-2xl tracking-tight">
          Product Verification
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
          Scan a QR pickup code or NAFDAC batch PIN to verify authenticity
        </p>
      </motion.div>

      {/* ── Demo hint ── */}
      <DemoHint />

      {/* ── Camera Viewfinder ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="mx-4 flex-1 min-h-[380px] max-h-[480px] rounded-2xl overflow-hidden border border-slate-800 relative"
      >
        <CameraView onScanSuccess={onScanSuccess} isActive={isActive} />
      </motion.div>

      {/* ── Mode legend ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mx-4 mt-3 grid grid-cols-2 gap-2"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 space-y-1">
          <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Mode A</p>
          <p className="text-white text-xs font-bold">Order Pickup QR</p>
          <p className="text-slate-500 text-[10px] leading-relaxed">
            Marks order <code className="text-slate-400">COMPLETED</code> & updates dashboard
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 space-y-1">
          <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Mode B</p>
          <p className="text-white text-xs font-bold">NAFDAC Authenticity</p>
          <p className="text-slate-500 text-[10px] leading-relaxed">
            Checks batch against NAFDAC manufacturer registry
          </p>
        </div>
      </motion.div>

      {/* ── Scan History ── */}
      <AnimatePresence>
        {recentLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-3 mb-4 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 space-y-1"
          >
            <div className="flex items-center gap-2 mb-2">
              <History size={13} className="text-slate-500" />
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                Recent Scans
              </p>
            </div>
            {recentLogs.map(log => (
              <LogItem
                key={log.id}
                code={log.scanned_code}
                isAuthentic={log.is_authentic}
                ts={log.created_at}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ensure some bottom padding on mobile */}
      <div className="h-4" />

      {/* ── Verification Result Modal ── */}
      <VerificationModal
        scanState={scanState}
        result={result}
        errorMessage={errorMessage}
        onReset={resetScanner}
        onRequestRefund={handleRequestRefund}
        pharmacyPhone="+2348012345678"
      />
    </motion.div>
  );
}
