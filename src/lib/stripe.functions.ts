import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type Stripe from "stripe";

// Stripe is server-only — load it inside handlers so it never ships to the client bundle.
async function getStripe(): Promise<Stripe> {
  const { default: StripeCtor } = await import("stripe");
  return new StripeCtor(process.env.STRIPE_SECRET_KEY || "");
}

const paymentIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  description: z.string().min(1),
  metadata: z.record(z.string(), z.string()).optional(),
});

const confirmSchema = z.object({ paymentIntentId: z.string().min(1) });

const checkoutSchema = z.object({
  listingType: z.enum(["standard", "premium"]),
  categorySlug: z.string().min(1),
  userEmail: z.string().email(),
  listingTitle: z.string().min(1),
});

const subscriptionSchema = z.object({
  listingType: z.enum(["standard", "premium"]),
  categorySlug: z.string().min(1),
  userEmail: z.string().email(),
  listingTitle: z.string().min(1),
  billingInterval: z.enum(["month", "year"]),
});

export const createPaymentIntent = createServerFn({ method: "POST" })
  .inputValidator((input) => paymentIntentSchema.parse(input))
  .handler(async ({ data }) => {
    const stripe = await getStripe();
    try {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase(),
        description: data.description,
        metadata: data.metadata || {},
      });
      return {
        clientSecret: intent.client_secret,
        id: intent.id,
      };
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

export const confirmPayment = createServerFn({ method: "POST" })
  .inputValidator((input) => confirmSchema.parse(input))
  .handler(async ({ data }) => {
    const stripe = await getStripe();
    try {
      const intent = await stripe.paymentIntents.retrieve(data.paymentIntentId);
      return {
        status: intent.status,
        id: intent.id,
        amount: intent.amount / 100, // Convert from cents
        succeeded: intent.status === "succeeded",
      };
    } catch (error) {
      throw new Error(`Failed to confirm payment: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((input) => checkoutSchema.parse(input))
  .handler(async ({ data }) => {
    const stripe = await getStripe();
    const prices: Record<"standard" | "premium", number> = {
      standard: 9.99,
      premium: 19.99,
    };

    const price = prices[data.listingType];

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `${data.listingType === "premium" ? "TOP " : ""}Oglas: ${data.listingTitle}`,
                description: `Objava oglasa u kategoriji ${data.categorySlug}`,
              },
              unit_amount: Math.round(price * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.VITE_APP_URL || "https://biraj.com.hr"}/racun/plaćanje-potvrda?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.VITE_APP_URL || "https://biraj.com.hr"}/objavi?payment=cancelled`,
        customer_email: data.userEmail,
        metadata: {
          listingType: data.listingType,
          categorySlug: data.categorySlug,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

export const createSubscriptionCheckout = createServerFn({ method: "POST" })
  .inputValidator((input) => subscriptionSchema.parse(input))
  .handler(async ({ data }) => {
    const stripe = await getStripe();
    const monthlyPrices: Record<"standard" | "premium", number> = {
      standard: 29.99,
      premium: 79.99,
    };

    const monthlyPrice = monthlyPrices[data.listingType];

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `${data.listingType === "premium" ? "TOP " : ""}Oglas - Subscription: ${data.listingTitle}`,
                description: `Mjesečni subscription oglasa u kategoriji ${data.categorySlug}`,
              },
              unit_amount: Math.round(monthlyPrice * 100),
              recurring: {
                interval: data.billingInterval,
                interval_count: 1,
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.VITE_APP_URL || "https://biraj.com.hr"}/racun/subscription-potvrda?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.VITE_APP_URL || "https://biraj.com.hr"}/racun/oglasi?payment=cancelled`,
        customer_email: data.userEmail,
        metadata: {
          listingType: data.listingType,
          categorySlug: data.categorySlug,
          billingInterval: data.billingInterval,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
