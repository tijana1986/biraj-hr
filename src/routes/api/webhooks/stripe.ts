import { json } from "@tanstack/react-start";

export async function POST({ request }: { request: Request }) {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return json({ error: "Missing signature" }, { status: 400 });
    }

    const body = await request.text();
    const stripe = await import("stripe").then((m) => new m.default(process.env.STRIPE_SECRET_KEY || ""));

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;

        if (!session.metadata?.listingId || !session.customer_email) {
          return json({ error: "Missing metadata" }, { status: 400 });
        }

        // Get user by email
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", session.customer_email)
          .limit(1)
          .single();

        if (!profiles) {
          return json({ error: "User not found" }, { status: 404 });
        }

        const userId = profiles.id;
        const tierMap: Record<string, string> = {
          standard: "spotlight",
          premium: "premium",
        };
        const tier = tierMap[session.metadata.listingType] || "spotlight";

        // Calculate expiry
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Save order
        await supabase.from("promotion_orders").insert({
          user_id: userId,
          listing_id: session.metadata.listingId,
          tier,
          price_eur: (session.amount_total || 0) / 100,
          currency: session.currency?.toUpperCase() || "EUR",
          stripe_session_id: session.id,
          payment_status: "completed",
          payment_method: "card",
          completed_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        });

        // Update listing
        await supabase
          .from("listings")
          .update({
            promotion_tier: tier,
            promotion_expires_at: expiresAt.toISOString(),
            promotion_activated_at: new Date().toISOString(),
          })
          .eq("id", session.metadata.listingId);

        return json({ success: true, received: true });
      }

      case "charge.failed": {
        const charge = event.data.object as any;
        if (charge.payment_intent) {
          await supabase
            .from("promotion_orders")
            .update({ payment_status: "failed" })
            .eq("stripe_payment_intent_id", charge.payment_intent);
        }
        return json({ success: true, received: true });
      }

      default:
        return json({ success: true, received: true });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 500 }
    );
  }
}
