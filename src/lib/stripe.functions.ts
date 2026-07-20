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
        success_url: `${process.env.VITE_APP_URL || "https://biraj.hr"}/racun/plaćanje-potvrda?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.VITE_APP_URL || "https://biraj.hr"}/objavi?payment=cancelled`,
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
