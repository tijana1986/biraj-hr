import { createFileRoute } from "@tanstack/react-router";
import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const Route = createFileRoute("/api/stripe/create-subscription-checkout")({
  async handler({ request }) {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    try {
      const { customerId } = await request.json();

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
              unit_amount: 3000, // €30 in cents
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

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({ error: "Greška pri kreiranju checkout-a" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});
