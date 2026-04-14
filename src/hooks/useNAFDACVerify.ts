import { useState, useCallback, useRef } from 'react';
import { useSupabase } from '../lib/mock-db';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScanState =
  | 'IDLE'
  | 'SCANNING'
  | 'DETECTED'
  | 'VERIFYING'
  | 'ORDER_COMPLETE'
  | 'AUTHENTIC'
  | 'FAILED';

export interface VerificationResult {
  type: 'order' | 'nafdac';
  orderId?: string;
  batchCode?: string;
  manufacturer?: string;
  drugName?: string;
  expiryDate?: string;
  isAuthentic: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNAFDACVerify() {
  const { verifyBatchCode, completeOrderByScan, logVerification } = useSupabase();

  const [scanState, setScanState] = useState<ScanState>('IDLE');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedRaw, setDetectedRaw] = useState<string>('');

  // Prevent double-processing when html5-qrcode fires multiple callbacks
  const processingRef = useRef(false);

  // ── Route a raw scanned / typed string through the dual-mode logic ──────────
  const processCode = useCallback(
    async (raw: string) => {
      if (processingRef.current) return;
      processingRef.current = true;

      const trimmed = raw.trim();
      setDetectedRaw(trimmed);

      // 1️⃣ Optimistic UI — show "Verifying…" immediately
      setScanState('VERIFYING');
      setResult(null);
      setErrorMessage(null);

      try {
        // ── Branch A: Order Pickup QR ────────────────────────────────────────
        if (trimmed.toLowerCase().startsWith('pharmae-order-')) {
          const orderId = trimmed.replace(/^pharmae-order-/i, '');
          const success = await completeOrderByScan(orderId);

          if (success) {
            const res: VerificationResult = {
              type: 'order',
              orderId,
              isAuthentic: true,
            };
            setResult(res);
            setScanState('ORDER_COMPLETE');
          } else {
            setErrorMessage(
              `Order "${orderId}" not found or already processed.`
            );
            setScanState('FAILED');
            logVerification(trimmed, false);
          }
          return;
        }

        // ── Branch B: NAFDAC / Batch Code ────────────────────────────────────
        const batch = await verifyBatchCode(trimmed);

        if (batch && batch.is_authentic) {
          const res: VerificationResult = {
            type: 'nafdac',
            batchCode: batch.batch_code,
            manufacturer: batch.manufacturer,
            drugName: batch.drug_name,
            expiryDate: batch.expiry_date,
            isAuthentic: true,
          };
          setResult(res);
          setScanState('AUTHENTIC');
          logVerification(trimmed, true);
        } else if (batch && !batch.is_authentic) {
          // Known counterfeit
          setErrorMessage(
            'COUNTERFEIT DETECTED — This batch is flagged in the NAFDAC registry.'
          );
          setScanState('FAILED');
          logVerification(trimmed, false);
        } else {
          // Not in registry at all
          setErrorMessage(
            'Code not found in NAFDAC registry. Cannot verify authenticity.'
          );
          setScanState('FAILED');
          logVerification(trimmed, false);
        }
      } catch (err) {
        console.error('[useNAFDACVerify] processing error:', err);
        setErrorMessage('Verification failed due to a network error. Try again.');
        setScanState('FAILED');
      } finally {
        processingRef.current = false;
      }
    },
    [verifyBatchCode, completeOrderByScan, logVerification]
  );

  const startScanning = useCallback(() => {
    setScanState('SCANNING');
    setResult(null);
    setErrorMessage(null);
    processingRef.current = false;
  }, []);

  const stopScanning = useCallback(() => {
    setScanState('IDLE');
  }, []);

  // Called by CameraView's html5-qrcode success callback
  const onScanSuccess = useCallback(
    (decodedText: string) => {
      setScanState('DETECTED');
      // Defer to next tick so the DETECTED flash renders, then immediately verify
      requestAnimationFrame(() => processCode(decodedText));
    },
    [processCode]
  );

  const handleManualInput = useCallback(
    async (code: string) => {
      if (!code.trim()) return;
      setScanState('DETECTED');
      await processCode(code);
    },
    [processCode]
  );

  const resetScanner = useCallback(() => {
    setScanState('SCANNING');
    setResult(null);
    setErrorMessage(null);
    setDetectedRaw('');
    processingRef.current = false;
  }, []);

  return {
    scanState,
    result,
    errorMessage,
    detectedRaw,
    startScanning,
    stopScanning,
    onScanSuccess,
    handleManualInput,
    resetScanner,
  };
}
