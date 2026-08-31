import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-15.acacia",
});

// Pricing constants
export const SUBSCRIPTION_PRICE_EUR = 3000; // €30 in cents
export const FEATURED_LISTING_PRICE_EUR = 800; // €8 in cents

// Create subscription checkout session
export async function createSubscriptionCheckout(
  customerId: string
): Promise<{ url: string | null; error?: string }> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Marketplace Pretplata",
              description: "€30/mesečno - Neograničeni oglasi",
            },
            unit_amount: SUBSCRIPTION_PRICE_EUR,
            recurring: {
              interval: "month",
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.VITE_APP_URL}/dashboard?success=subscription`,
      cancel_url: `${process.env.VITE_APP_URL}/dashboard`,
    });

    return { url: session.url };
  } catch (error) {
    console.error("Error creating subscription checkout:", error);
    return { url: null, error: "Greška pri kreiranju checkout-a" };
  }
}

// Create featured listing checkout session
export async function createFeaturedListingCheckout(
  customerId: string,
  listingId: string
): Promise<{ url: string | null; error?: string }> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Istaknut Oglas",
              description: "30 dana dodatne vidljivosti",
            },
            unit_amount: FEATURED_LISTING_PRICE_EUR,
          },
          quantity: 1,
        },
      ],
      metadata: {
        listing_id: listingId,
        type: "featured_listing",
      },
      success_url: `${process.env.VITE_APP_URL}/dashboard?success=featured`,
      cancel_url: `${process.env.VITE_APP_URL}/dashboard`,
    });

    return { url: session.url };
  } catch (error) {
    console.error("Error creating featured listing checkout:", error);
    return { url: null, error: "Greška pri kreiranju checkout-a" };
  }
}

export { stripe };
