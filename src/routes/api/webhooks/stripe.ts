import { createFileRoute } from "@tanstack/react-router";
import { Stripe } from "stripe";
import { supabase } from "@/integrations/supabase/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const Route = createFileRoute("/api/webhooks/stripe")({
  async handler({ request }) {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    try {
      const signature = request.headers.get("stripe-signature") || "";
      const body = await request.text();

      // Verify webhook signature
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET || ""
        );
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
      }

      // Handle different event types
      switch (event.type) {
        case "charge.succeeded": {
          const charge = event.data.object as Stripe.Charge;
          if (charge.metadata?.type === "featured_listing") {
            const { listing_id, user_id } = charge.metadata;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            await supabase.from("featured_listings").insert({
              listing_id,
              expires_at: expiresAt.toISOString(),
            });

            await supabase.from("payments").insert({
              user_id,
              amount: 8,
              payment_type: "featured_listing",
              description: "Istaknut oglas",
              stripe_payment_id: charge.id,
              status: "completed",
            });
          }
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = subscription.metadata?.user_id;

          if (userId) {
            const periodStart = new Date(subscription.current_period_start * 1000);
            const periodEnd = new Date(subscription.current_period_end * 1000);

            await supabase.from("subscriptions").upsert({
              user_id: userId,
              status: subscription.status === "active" ? "active" : "expired",
              current_period_start: periodStart.toISOString(),
              current_period_end: periodEnd.toISOString(),
              next_billing_date: periodEnd.toISOString(),
              stripe_subscription_id: subscription.id,
            });
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await supabase
            .from("subscriptions")
            .update({ status: "cancelled" })
            .eq("stripe_subscription_id", subscription.id);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            await supabase
              .from("subscriptions")
              .update({ status: "expired" })
              .eq("stripe_subscription_id", invoice.subscription);
          }
          break;
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response(JSON.stringify({ error: "Webhook error" }), { status: 500 });
    }
  },
});
