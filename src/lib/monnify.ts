declare global {
  interface Window {
    MonnifySDK: any;
  }
}

export interface MonnifyPaymentOptions {
  amount: number;
  customerFullName: string;
  customerEmail: string;
  customerMobileNumber: string;
  paymentDescription: string;
  onComplete: (response: any) => void;
  onClose: (data: any) => void;
}

export const initializeMonnifyPayment = (options: MonnifyPaymentOptions) => {
  const apiKey = import.meta.env.VITE_MONNIFY_API_KEY;
  const contractCode = import.meta.env.VITE_MONNIFY_CONTRACT_CODE;

  if (!apiKey || !contractCode) {
    console.error('Monnify configuration is missing. Check VITE_MONNIFY_API_KEY and VITE_MONNIFY_CONTRACT_CODE.');
    alert('Payment gateway is currently unavailable.');
    options.onClose({ status: 'FAILED' });
    return;
  }

  if (typeof window.MonnifySDK === 'undefined') {
    console.error('Monnify SDK script not loaded.');
    alert('Failed to load payment gateway.');
    options.onClose({ status: 'FAILED' });
    return;
  }

  window.MonnifySDK.initialize({
    amount: options.amount,
    currency: "NGN",
    reference: '' + Math.floor((Math.random() * 1000000000) + 1),
    customerFullName: options.customerFullName,
    customerEmail: options.customerEmail,
    apiKey: apiKey,
    contractCode: contractCode,
    paymentDescription: options.paymentDescription,
    metadata: {
      "name": options.customerFullName,
    },
    onLoadStart: () => {
      console.log("Monnify loading started");
    },
    onLoadComplete: () => {
      console.log("Monnify loading completed");
    },
    onComplete: function(response: any) {
      // payment can be verified using the response.transactionReference
      console.log("Payment complete:", response);
      options.onComplete(response);
    },
    onClose: function(data: any) {
      // handles payment modal close
      console.log("Payment modal closed:", data);
      options.onClose(data);
    }
  });
};
