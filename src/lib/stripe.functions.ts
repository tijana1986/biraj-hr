import { server$ } from "@tanstack/react-start";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export const createPaymentIntent = server$(async (props: {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}) => {
  try {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(props.amount * 100), // Convert to cents
      currency: props.currency.toLowerCase(),
      description: props.description,
      metadata: props.metadata || {},
    });
    return {
      clientSecret: intent.client_secret,
      id: intent.id,
    };
  } catch (error) {
    throw new Error(`Failed to create payment intent: ${error instanceof Error ? error.message : String(error)}`);
  }
});

export const confirmPayment = server$(async (props: {
  paymentIntentId: string;
}) => {
  try {
    const intent = await stripe.paymentIntents.retrieve(props.paymentIntentId);
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

export const createCheckoutSession = server$(async (props: {
  listingType: "standard" | "premium";
  categorySlug: string;
  userEmail: string;
  listingTitle: string;
}) => {
  const prices: Record<"standard" | "premium", number> = {
    standard: 9.99,
    premium: 19.99,
  };

  const price = prices[props.listingType];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${props.listingType === "premium" ? "TOP " : ""}Oglas: ${props.listingTitle}`,
              description: `Objava oglasa u kategoriji ${props.categorySlug}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.VITE_APP_URL || "https://biraj.hr"}/racun/oglasi?payment=success`,
      cancel_url: `${process.env.VITE_APP_URL || "https://biraj.hr"}/objavi?payment=cancelled`,
      customer_email: props.userEmail,
      metadata: {
        listingType: props.listingType,
        categorySlug: props.categorySlug,
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
