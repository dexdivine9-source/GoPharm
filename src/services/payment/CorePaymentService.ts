import { PaymentIntentRequest, PaymentIntentResponse, IPaymentGateway, WebhookEvent } from './types';
import { MonnifyAdapter } from './adapters/MonnifyAdapter';
import { PaystackAdapter } from './adapters/PaystackAdapter';

export class CorePaymentService {
  private adapters: Map<string, IPaymentGateway>;

  constructor() {
    this.adapters = new Map();
    
    // Register Adapters
    const monnify = new MonnifyAdapter();
    this.adapters.set(monnify.getProviderName(), monnify);
    
    const paystack = new PaystackAdapter();
    this.adapters.set(paystack.getProviderName(), paystack);
  }

  /**
   * Intelligently routes the payment initialize request based on chosen method.
   */
  async initiatePayment(req: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    // Architectural Rule: BANK_TRANSFER uses Monnify, CARD uses Paystack
    const targetProvider = req.method === 'BANK_TRANSFER' ? 'MONNIFY' : 'PAYSTACK';
    
    const adapter = this.adapters.get(targetProvider);
    if (!adapter) {
      throw new Error(`Integration for ${targetProvider} is not configured.`);
    }

    // Generate Intent via Adapter
    try {
      const response = await adapter.initializePayment(req);
      
      // TODO: Log Transaction Attempt to Database (Status: PENDING)
      console.log(`[DB] Saving Txn: ${response.reference} -> PENDING`);

      return response;
    } catch (error) {
      console.error(`[PaymentService] Initiate Error:`, error);
      throw error;
    }
  }

  /**
   * Handles webhook from ANY provider, double-verifies, and securely updates order status
   */
  async processWebhook(providerName: string, payload: any, signature: string): Promise<void> {
    const adapter = this.adapters.get(providerName.toUpperCase());
    if (!adapter) {
      throw new Error(`Unknown Webhook Provider: ${providerName}`);
    }

    // 1. Validate Cryptographic Signature
    let webhookEvent: WebhookEvent;
    try {
      webhookEvent = adapter.parseAndValidateWebhook(payload, signature);
    } catch (error) {
      console.error(`[Webhook] Invalid signature for ${providerName}`, error);
      throw error; // System throws 400 back to provider
    }

    // Only process successful payments (failed/pending don't dispatch goods)
    if (webhookEvent.status !== 'SUCCESS') {
      console.log(`[Webhook] Ignoring non-success status: ${webhookEvent.status}`);
      return;
    }

    const { transactionReference } = webhookEvent;

    // 2. IDEMPOTENCY CHECK
    // TODO: Acquire Redis Lock using `transactionReference` to prevent duplicate concurrent processing
    // Example: const lock = await redis.set(`lock:${transactionReference}`, '1', 'NX', 'EX', 60);
    // if (!lock) return; // Already processing

    // 3. DOUBLE VERIFICATION (Crucial Security Step)
    // Never trust the webhook blindly. Make a real server-to-server call.
    const realStatus = await adapter.verifyTransaction(transactionReference);
    
    if (realStatus === 'SUCCESS') {
      // 4. DATABASE UPDATE (State Machine transition)
      // TODO: Update Database Txn Status to PAID
      console.log(`[DB] Updating Transaction ${transactionReference} to PAID`);
      
      // TODO: Find associated Order and mark it PAID, trigger dispatch logic
      console.log(`[DB] Order tagged PAID. Dispaching WebSocket event to frontend.`);
      
    } else {
      console.error(`[Webhook Fraud Alert] Webhook said SUCCESS but API said ${realStatus} for Ref: ${transactionReference}`);
    }
  }
}

// Export singleton instance for app-wide use
export const paymentService = new CorePaymentService();
