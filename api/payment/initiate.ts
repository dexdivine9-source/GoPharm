import { paymentService } from '../../src/services/payment/CorePaymentService';
import { PaymentIntentRequest } from '../../src/services/payment/types';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const paymentReq: PaymentIntentRequest = req.body;
    
    // In a real application, calculate/verify the amount here securely
    // instead of trusting the client payload!
    
    const intentResponse = await paymentService.initiatePayment(paymentReq);
    
    return res.status(200).json(intentResponse);
  } catch (error: any) {
    console.error('Payment Initialization Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
