import { json } from "@tanstack/react-start";
import { Resend } from "resend";

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

    const resend = new Resend(process.env.RESEND_API_KEY || "");

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
        const { data: orderData, error: orderError } = await supabase.from("promotion_orders").insert({
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
        }).select().single();

        if (orderError) {
          console.error("Order insert error:", orderError);
        }

        // Update listing
        await supabase
          .from("listings")
          .update({
            promotion_tier: tier,
            promotion_expires_at: expiresAt.toISOString(),
            promotion_activated_at: new Date().toISOString(),
          })
          .eq("id", session.metadata.listingId);

        // Send confirmation email
        try {
          const listingTitle = session.metadata.listingTitle || "Vaš oglas";
          const price = (session.amount_total || 0) / 100;

          await resend.emails.send({
            from: "noreply@biraj.com.hr",
            to: session.customer_email,
            subject: `Potvrda plaćanja - Promotion aktiviran #${session.id}`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #d4af37 0%, #c49a27 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
                    .footer { background: #f0f0f0; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
                    .order-details { background: white; padding: 15px; border-radius: 4px; margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .detail-row:last-child { border-bottom: none; }
                    .button { background: #d4af37; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; display: inline-block; margin: 20px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Plaćanje je uspješno! ✓</h1>
                      <p>Hvala što ste odabrali promotion za svoj oglas na Biraj.hr</p>
                    </div>

                    <div class="content">
                      <p>Poštovani,</p>
                      <p>Vaš promotion je aktiviran i vaš oglas će biti vidljiv u premium sekciji na početnoj stranici.</p>

                      <div class="order-details">
                        <h3>Detalji narudžbe</h3>
                        <div class="detail-row">
                          <strong>Broj narudžbe:</strong>
                          <span>${session.id}</span>
                        </div>
                        <div class="detail-row">
                          <strong>Tier:</strong>
                          <span>${tier}</span>
                        </div>
                        <div class="detail-row">
                          <strong>Cijena:</strong>
                          <span>€${price.toFixed(2)}/tjedan</span>
                        </div>
                        <div class="detail-row">
                          <strong>Ističe:</strong>
                          <span>${expiresAt.toLocaleDateString("hr-HR")}</span>
                        </div>
                      </div>

                      <p><strong>Što se dalje?</strong></p>
                      <ul>
                        <li>Promotion će biti aktivna u roku od 1 sata</li>
                        <li>Tvoj oglas će biti prikazan u "Premium oglasi" sekciji</li>
                        <li>Možeš pogledati status u <a href="https://biraj.com.hr/racun/placanja">Mojim plaćanjima</a></li>
                      </ul>

                      <p style="text-align: center;">
                        <a href="https://biraj.com.hr/racun/oglasi" class="button">Pogledaj svoje oglase</a>
                      </p>
                    </div>

                    <div class="footer">
                      <p>© 2024 Biraj.hr - Marketplace za oglase. Sva prava zadržana.</p>
                      <p>Ako imaš pitanja, kontaktiraj nas na <a href="mailto:support@biraj.com.hr">support@biraj.com.hr</a></p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });
        } catch (emailError) {
          console.error("Email send error:", emailError);
        }

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

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;

        if (!subscription.id) {
          return json({ error: "Missing subscription ID" }, { status: 400 });
        }

        const { data: existingSubscription } = await supabase
          .from("subscription_orders")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .limit(1)
          .single();

        if (!existingSubscription) {
          await supabase.from("subscription_orders").insert({
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            next_billing_date: new Date(subscription.current_period_end * 1000).toISOString(),
          });
        } else {
          await supabase
            .from("subscription_orders")
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              next_billing_date: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("stripe_subscription_id", subscription.id);
        }

        return json({ success: true, received: true });
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;

        await supabase
          .from("subscription_orders")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        return json({ success: true, received: true });
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;

        if (invoice.subscription) {
          await supabase
            .from("subscription_orders")
            .update({
              status: "active",
              next_billing_date: new Date(invoice.next_payment_attempt * 1000).toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription);
        }

        return json({ success: true, received: true });
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;

        if (invoice.subscription) {
          await supabase
            .from("subscription_orders")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription);
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
