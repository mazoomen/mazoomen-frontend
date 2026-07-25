/**
 * Helper function to trigger Tap Payments charge creation and redirect to Checkout URL
 */
export interface CreateChargeParams {
  customerName: string;
  customerEmail: string;
  templateDetails: Record<string, any>;
  amount: number;
  currency?: string;
}

export interface CreateChargeResponse {
  orderId: string;
  tapChargeId?: string;
  checkoutUrl: string;
}

export async function initiateTapPayment(params: CreateChargeParams): Promise<CreateChargeResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const response = await fetch(`${backendUrl}/payment/create-charge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      templateDetails: params.templateDetails,
      amount: params.amount,
      currency: params.currency || 'KWD',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to initiate payment with Tap Payments.');
  }

  if (!data.checkoutUrl) {
    throw new Error('Checkout URL was not returned from the server.');
  }

  return data;
}

/**
 * Triggers Buy Now process: calls API and redirects window to Tap Hosted Checkout
 */
export async function handleBuyNow(params: CreateChargeParams): Promise<void> {
  const { checkoutUrl } = await initiateTapPayment(params);
  // Redirect window to Tap Payments Hosted Checkout page
  window.location.href = checkoutUrl;
}
