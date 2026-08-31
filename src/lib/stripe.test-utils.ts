/**
 * Stripe Testing Utilities
 *
 * Use these utilities to test payment flows locally.
 * Requires Stripe CLI to be running: stripe listen --forward-to localhost:5173/api/webhooks/stripe
 */

export const STRIPE_TEST_CARDS = {
  SUCCESS: {
    number: "4242 4242 4242 4242",
    expiry: "12/25",
    cvc: "123",
    description: "Successful payment"
  },
  DECLINED: {
    number: "4000 0000 0000 0002",
    expiry: "12/25",
    cvc: "123",
    description: "Card declined"
  },
  INSUFFICIENT_FUNDS: {
    number: "4000 0000 0000 9995",
    expiry: "12/25",
    cvc: "123",
    description: "Insufficient funds"
  },
  EXPIRED_CARD: {
    number: "4000 0000 0000 0069",
    expiry: "12/20",
    cvc: "123",
    description: "Expired card"
  },
  PROCESSING_ERROR: {
    number: "4000 0000 0000 0119",
    expiry: "12/25",
    cvc: "123",
    description: "Processing error"
  },
  "3D_SECURE": {
    number: "4000 0025 0000 3155",
    expiry: "12/25",
    cvc: "123",
    description: "3D Secure required"
  }
};

/**
 * Log test information for debugging
 */
export function logTestInfo(title: string, data: any) {
  if (import.meta.env.DEV) {
    console.group(`🧪 ${title}`);
    console.table(data);
    console.groupEnd();
  }
}

/**
 * Simulate webhook event locally
 * Requires Stripe CLI: stripe trigger <event_name>
 */
export const STRIPE_TEST_EVENTS = {
  PAYMENT_SUCCESS: "checkout.session.completed",
  PAYMENT_FAILED: "charge.failed",
  PAYMENT_REFUNDED: "charge.refunded",
  SUBSCRIPTION_CREATED: "customer.subscription.created",
  SUBSCRIPTION_UPDATED: "customer.subscription.updated",
  SUBSCRIPTION_DELETED: "customer.subscription.deleted",
  INVOICE_SUCCEEDED: "invoice.payment_succeeded",
  INVOICE_FAILED: "invoice.payment_failed",
};

/**
 * Generate mock webhook payload for testing
 */
export function generateMockWebhookPayload(
  eventType: string,
  data: any
): any {
  const timestamp = Math.floor(Date.now() / 1000);

  return {
    id: `evt_${Math.random().toString(36).slice(2)}`,
    object: "event",
    api_version: "2023-10-16",
    created: timestamp,
    data: {
      object: data,
      previous_attributes: {},
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: null,
      idempotency_key: null,
    },
    type: eventType,
  };
}

/**
 * Test data generators
 */
export const TEST_DATA_GENERATORS = {
  testEmail: () => `test-${Date.now()}@example.com`,
  testListingId: () => `listing-${Math.random().toString(36).slice(2)}`,
  testSessionId: () => `cs_test_${Math.random().toString(36).slice(2)}`,
  testSubscriptionId: () => `sub_test_${Math.random().toString(36).slice(2)}`,
  testPaymentMethodId: () => `pm_test_${Math.random().toString(36).slice(2)}`,
};

/**
 * Log payment flow steps
 */
export function logPaymentStep(step: string, data?: any) {
  const timestamp = new Date().toLocaleTimeString();
  if (import.meta.env.DEV) {
    console.log(`[${timestamp}] 💳 ${step}`, data || "");
  }
}

/**
 * Validate email for testing
 */
export function isValidTestEmail(email: string): boolean {
  const testEmailRegex = /^test-\d+@example\.com$/;
  return testEmailRegex.test(email) || /@example\.com$/.test(email);
}

/**
 * Format card number for display
 */
export function formatCardNumber(number: string): string {
  const cleaned = number.replace(/\s/g, "");
  return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/**
 * Test payment flow checklist
 */
export const PAYMENT_FLOW_CHECKLIST = {
  preCheckout: [
    "✓ User logged in",
    "✓ Listing selected",
    "✓ Tier chosen",
    "✓ Email entered",
  ],
  checkout: [
    "✓ Redirect to Stripe",
    "✓ Payment form displayed",
    "✓ Test card entered",
    "✓ Payment submitted",
  ],
  postPayment: [
    "✓ Webhook received",
    "✓ Order created in DB",
    "✓ Email sent",
    "✓ Redirect to success",
  ],
  verification: [
    "✓ Check promotion_orders table",
    "✓ Verify payment_status = 'completed'",
    "✓ Check listing has promotion_tier",
    "✓ Verify email in Resend dashboard",
  ],
};

/**
 * Local Stripe CLI commands reference
 */
export const STRIPE_CLI_COMMANDS = {
  installMac: "brew install stripe/stripe-cli/stripe",
  installLinux: "curl https://files.stripe.com/stripe-cli/install.sh -O && bash install.sh",
  login: "stripe login",
  listen: "stripe listen --forward-to localhost:5173/api/webhooks/stripe",
  triggerPayment: "stripe trigger checkout.session.completed",
  triggerSubscription: "stripe trigger customer.subscription.created",
  triggerRefund: "stripe trigger charge.refunded",
  viewLogs: "stripe logs tail",
  testPayment: "stripe charges create --amount=1000 --currency=usd --source=tok_visa",
};

/**
 * Debug helper: Print all available test data
 */
export function printTestDataHelpers() {
  if (import.meta.env.DEV) {
    console.group("🧪 Test Data Generators");
    console.log("Email:", TEST_DATA_GENERATORS.testEmail());
    console.log("Listing ID:", TEST_DATA_GENERATORS.testListingId());
    console.log("Session ID:", TEST_DATA_GENERATORS.testSessionId());
    console.log("Subscription ID:", TEST_DATA_GENERATORS.testSubscriptionId());
    console.log("Payment Method ID:", TEST_DATA_GENERATORS.testPaymentMethodId());
    console.groupEnd();

    console.group("💳 Test Cards");
    console.table(STRIPE_TEST_CARDS);
    console.groupEnd();

    console.group("📡 Webhook Events");
    console.table(STRIPE_TEST_EVENTS);
    console.groupEnd();

    console.group("🖥️ CLI Commands");
    console.table(STRIPE_CLI_COMMANDS);
    console.groupEnd();
  }
}

/**
 * Network request logger (development only)
 */
export function logNetworkRequest(
  method: string,
  url: string,
  data?: any,
  response?: any
) {
  if (import.meta.env.DEV) {
    console.group(`🌐 ${method} ${url}`);
    if (data) console.log("Request:", data);
    if (response) console.log("Response:", response);
    console.groupEnd();
  }
}

/**
 * Error formatter for payment errors
 */
export function formatPaymentError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error?.data?.message) {
    return error.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return "An unknown error occurred";
}
