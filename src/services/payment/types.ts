export type PaymentMethod = 'BANK_TRANSFER' | 'CARD';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface PaymentIntentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  method: PaymentMethod;
}

export interface PaymentIntentResponse {
  provider: string;
  reference: string;
  status: PaymentStatus;
  
  // Paystack (Card) typically returns a checkout URL / access code
  checkoutUrl?: string; 
  accessCode?: string;

  // Monnify (Bank Transfer) returns a dedicated or reserved virtual account
  virtualAccount?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    expiresAt?: string;
  }; 
}

export interface WebhookEvent {
  provider: string;
  status: PaymentStatus;
  transactionReference: string;
  amountPaid: number;
  rawPayload: any;
}

export interface IPaymentGateway {
  getProviderName(): string;
  initializePayment(req: PaymentIntentRequest): Promise<PaymentIntentResponse>;
  verifyTransaction(transactionRef: string): Promise<PaymentStatus>;
  parseAndValidateWebhook(payload: any, signature: string): WebhookEvent;
}
