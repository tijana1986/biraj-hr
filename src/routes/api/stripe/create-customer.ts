import { createFileRoute } from "@tanstack/react-router";
import { Stripe } from "stripe";
import { supabase } from "@/integrations/supabase/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const Route = createFileRoute("/api/stripe/create-customer")({
  async handler({ request }) {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    try {
      const { userId, email } = await request.json();

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id: userId },
      });

      // Save to Supabase
      await supabase.from("customers").insert({
        user_id: userId,
        stripe_customer_id: customer.id,
      });

      return new Response(JSON.stringify({ customerId: customer.id }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({ error: "Greška pri kreiranju kupca" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});
