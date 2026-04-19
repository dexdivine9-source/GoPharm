import { paymentService } from '../../src/services/payment/CorePaymentService';

/* 
 * Required for providers like Paystack/Monnify that require the EXACT raw body string
 * for HMAC SHA512 signature computation.
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

const getRawBody = async (req: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => { body += chunk.toString(); });
    req.on('end', () => { resolve(body); });
    req.on('error', reject);
  });
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Determine provider from query param (e.g. /api/payment/webhook?provider=MONNIFY)
    const provider = String(req.query.provider || '').toUpperCase();
    
    const rawBodyData = await getRawBody(req);
    const payload = JSON.parse(rawBodyData);
    
    let signature = '';
    if (provider === 'MONNIFY') {
      signature = req.headers['monnify-signature'] as string;
    } else if (provider === 'PAYSTACK') {
      signature = req.headers['x-paystack-signature'] as string;
    }
    
    if (!provider) return res.status(400).json({ error: 'Missing provider identifier.' });
    if (!signature) return res.status(400).json({ error: 'Missing webhook signature.' });

    // Validate using the RAW string block or parsed JSON based on provider adapter needs
    // Monnify standard requires stringified JSON which can differ based on engine.
    // For absolute safety, Webhook parsers should pass `payload` down.
    await paymentService.processWebhook(provider, payload, signature);

    // Always respond 200 to acknowledge receipt immediately
    return res.status(200).json({ message: 'Webhook received' });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ error: error.message || 'Server Error' });
  }
}
