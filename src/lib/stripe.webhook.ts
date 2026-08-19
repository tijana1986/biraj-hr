import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type Stripe from "stripe";

async function getStripe(): Promise<Stripe> {
  const { default: StripeCtor } = await import("stripe");
  return new StripeCtor(process.env.STRIPE_SECRET_KEY || "");
}

async function getSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.VITE_SUPABASE_URL || "",
    process.env.SUPABASE_PUBLISHABLE_KEY || ""
  );
}

const webhookEventSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});

export const handleStripeWebhook = createServerFn({ method: "POST" })
  .inputValidator((input) => webhookEventSchema.parse(input))
  .handler(async ({ data }) => {
    const stripe = await getStripe();
    const supabase = await getSupabase();

    const event = data;

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;

          if (!session.metadata?.listingType || !session.customer_email) {
            throw new Error("Missing required metadata");
          }

          // Get user by email
          const { data: profiles, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", session.customer_email)
            .limit(1)
            .single();

          if (profileError || !profiles) {
            throw new Error(`User not found for email: ${session.customer_email}`);
          }

          const userId = profiles.id;

          // Determine tier from listing type
          const tierMap = {
            standard: "spotlight",
            premium: "premium",
          };
          const tier = tierMap[session.metadata.listingType as keyof typeof tierMap] || "spotlight";

          // Calculate promotion expiry (7 days from now)
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);

          // Create promotion order record
          const { error: orderError } = await supabase
            .from("promotion_orders")
            .insert({
              user_id: userId,
              listing_id: session.metadata.listingId || null,
              tier,
              price_eur: (session.amount_total || 0) / 100,
              currency: session.currency?.toUpperCase() || "EUR",
              stripe_session_id: session.id,
              payment_status: "completed",
              payment_method: "card",
              completed_at: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
            });

          if (orderError) {
            throw new Error(`Failed to create order: ${orderError.message}`);
          }

          // Update listing with promotion
          if (session.metadata.listingId) {
            const { error: updateError } = await supabase
              .from("listings")
              .update({
                promotion_tier: tier,
                promotion_expires_at: expiresAt.toISOString(),
                promotion_activated_at: new Date().toISOString(),
              })
              .eq("id", session.metadata.listingId);

            if (updateError) {
              throw new Error(`Failed to update listing: ${updateError.message}`);
            }
          }

          return { success: true, message: "Promotion activated" };
        }

        case "charge.failed": {
          const charge = event.data.object as Stripe.Charge;

          // Update order status to failed
          if (charge.payment_intent) {
            const { error } = await supabase
              .from("promotion_orders")
              .update({ payment_status: "failed" })
              .eq("stripe_payment_intent_id", charge.payment_intent);

            if (error) {
              throw new Error(`Failed to update order status: ${error.message}`);
            }
          }

          return { success: true, message: "Payment failure recorded" };
        }

        case "charge.refunded": {
          const charge = event.data.object as Stripe.Charge;

          // Update order status to refunded
          if (charge.id) {
            const { error } = await supabase
              .from("promotion_orders")
              .update({ payment_status: "refunded" })
              .eq("stripe_session_id", charge.id);

            if (error) {
              throw new Error(`Failed to update refund: ${error.message}`);
            }
          }

          return { success: true, message: "Refund recorded" };
        }

        default:
          return { success: true, message: `Unhandled event type: ${event.type}` };
      }
    } catch (error) {
      console.error("Webhook error:", error);
      throw new Error(`Webhook processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
