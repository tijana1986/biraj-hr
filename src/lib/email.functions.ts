import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Resend and supabaseAdmin are server-only — load them inside handlers
// so they never ship to the client bundle.
async function getResend() {
  const { Resend } = await import("resend");
  return new Resend(process.env.RESEND_API_KEY);
}

async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const verificationEmailHtml = (verificationUrl: string, userName?: string) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #1a2647 0%, #2d3e5f 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Biraj.HR</h1>
    </div>
    <div style="padding: 40px; background: #f9fafb;">
      <p style="color: #1f2937; font-size: 16px; margin-bottom: 24px;">
        Pozdrav${userName ? `, ${userName}` : ""}!
      </p>
      <p style="color: #1f2937; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Hvala na registraciji na Biraj.HR. Molimo potvrdi svoj e-mail adresu kako bi završio registraciju i mogao početi s objavljivanjem oglasa.
      </p>
      <a href="${verificationUrl}" style="display: inline-block; background: #d4a574; color: #1a2647; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 24px 0;">
        Potvrdi e-mail
      </a>
      <p style="color: #6b7280; font-size: 12px; margin-top: 24px; line-height: 1.6;">
        Ili kopiraj ovaj link u svoj preglednik:<br>
        <span style="color: #3b82f6; word-break: break-all;">${verificationUrl}</span>
      </p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 24px;">
        Veza ističe za 24 sata. Ako nisi kreirao ovaj račun, ignoriraj ovaj e-mail.
      </p>
    </div>
    <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 8px 8px;">
      <p style="margin: 0;">&copy; 2026 Biraj.HR. Sva prava zadržana.</p>
    </div>
  </div>
`;

const sendVerificationSchema = z.object({
  email: z.string().email(),
  verificationToken: z.string().min(1),
  userName: z.string().optional(),
});

const verifySchema = z.object({
  token: z.string().min(1),
  userId: z.string().min(1),
});

const resendSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
});

export const sendVerificationEmail = createServerFn({ method: "POST" })
  .inputValidator((input) => sendVerificationSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const resend = await getResend();
      const verificationUrl = `${process.env.VITE_APP_URL || "https://biraj.hr"}/provjeri-email?token=${data.verificationToken}`;

      const result = await resend.emails.send({
        from: "noreply@biraj.hr",
        to: data.email,
        subject: "Potvrdi svoj e-mail na Biraj.HR",
        html: verificationEmailHtml(verificationUrl, data.userName),
      });

      if (result.error) {
        throw result.error;
      }

      return {
        success: true,
        message: `Verification email sent to ${data.email}`,
      };
    } catch (error) {
      console.error("Resend error:", error);
      throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

export const verifyEmail = createServerFn({ method: "POST" })
  .inputValidator((input) => verifySchema.parse(input))
  .handler(async ({ data: input }) => {
    try {
      const supabaseAdmin = await getSupabaseAdmin();

      const { data, error } = await supabaseAdmin
        .from("email_verifications")
        .select("*")
        .eq("token", input.token)
        .eq("user_id", input.userId)
        .single();

      if (error || !data) {
        throw new Error("Invalid or expired verification token");
      }

      if (data.verified_at) {
        throw new Error("Email already verified");
      }

      // Update email_verifications table
      const { error: updateError } = await supabaseAdmin
        .from("email_verifications")
        .update({ verified_at: new Date().toISOString() })
        .eq("id", data.id);

      if (updateError) throw updateError;

      // Update user profile to mark email as verified
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ email_verified: true })
        .eq("id", input.userId);

      if (profileError) throw profileError;

      return {
        success: true,
        message: "Email verified successfully",
      };
    } catch (error) {
      throw new Error(`Email verification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

export const resendVerificationEmail = createServerFn({ method: "POST" })
  .inputValidator((input) => resendSchema.parse(input))
  .handler(async ({ data: input }) => {
    try {
      const supabaseAdmin = await getSupabaseAdmin();

      // Check if already verified
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email_verified")
        .eq("id", input.userId)
        .single();

      if (profile?.email_verified) {
        throw new Error("Email is already verified");
      }

      // Generate new token
      const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

      // Update or create email verification record
      const { error } = await supabaseAdmin
        .from("email_verifications")
        .upsert(
          {
            user_id: input.userId,
            token,
            created_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

      if (error) throw error;

      const resend = await getResend();
      const verificationUrl = `${process.env.VITE_APP_URL || "https://biraj.hr"}/provjeri-email?token=${token}`;
      await resend.emails.send({
        from: "noreply@biraj.hr",
        to: input.email,
        subject: "Potvrdi svoj e-mail na Biraj.HR",
        html: verificationEmailHtml(verificationUrl),
      });

      return {
        success: true,
        message: "Verification email resent",
      };
    } catch (error) {
      throw new Error(`Failed to resend verification email: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

const sendPaymentConfirmationSchema = z.object({
  email: z.string().email(),
  orderNumber: z.string(),
  tier: z.string(),
  price: z.number(),
  listingTitle: z.string(),
  expiresAt: z.string(),
});

const sendRefundConfirmationSchema = z.object({
  email: z.string().email(),
  orderNumber: z.string(),
  refundAmount: z.number(),
  reason: z.string(),
});

export const sendPaymentConfirmation = createServerFn({ method: "POST" })
  .inputValidator((input) => sendPaymentConfirmationSchema.parse(input))
  .handler(async ({ data }) => {
    const resend = await getResend();

    const expiryDate = new Date(data.expiresAt).toLocaleDateString("hr-HR");

    const html = `
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
                  <span>${data.orderNumber}</span>
                </div>
                <div class="detail-row">
                  <strong>Oglas:</strong>
                  <span>${data.listingTitle}</span>
                </div>
                <div class="detail-row">
                  <strong>Tier:</strong>
                  <span>${data.tier}</span>
                </div>
                <div class="detail-row">
                  <strong>Cijena:</strong>
                  <span>€${data.price.toFixed(2)}/tjedan</span>
                </div>
                <div class="detail-row">
                  <strong>Ističe:</strong>
                  <span>${expiryDate}</span>
                </div>
              </div>

              <p><strong>Što se dalje?</strong></p>
              <ul>
                <li>Promotion će biti aktivna u roku od 1 sata</li>
                <li>Tvoj oglas će biti prikazan u "Premium oglasi" sekciji</li>
                <li>Možeš pogledati status u <a href="https://biraj.hr/racun/placanja">Mojim plaćanjima</a></li>
              </ul>

              <p style="text-align: center;">
                <a href="https://biraj.hr/racun/oglasi" class="button">Pogledaj svoje oglase</a>
              </p>
            </div>

            <div class="footer">
              <p>© 2024 Biraj.hr - Marketplace za oglase. Sva prava zadržana.</p>
              <p>Ako imaš pitanja, kontaktiraj nas na <a href="mailto:support@biraj.hr">support@biraj.hr</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const result = await resend.emails.send({
        from: "noreply@biraj.hr",
        to: data.email,
        subject: `Potvrda plaćanja - Promotion aktiviran #${data.orderNumber}`,
        html,
      });

      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error("Email send error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to send email" };
    }
  });

export const sendRefundConfirmation = createServerFn({ method: "POST" })
  .inputValidator((input) => sendRefundConfirmationSchema.parse(input))
  .handler(async ({ data }) => {
    const resend = await getResend();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f0f0f0; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
            .refund-box { background: white; padding: 20px; border-radius: 4px; border-left: 4px solid #10b981; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Povraćaj novca - Potvrda ✓</h1>
              <p>Vaš zahtjev je obrađen</p>
            </div>

            <div class="content">
              <p>Poštovani,</p>
              <p>Potvrdujemo da je povraćaj novca za vašu narudžbu #${data.orderNumber} obrađen.</p>

              <div class="refund-box">
                <h3>Detalji povraćaja</h3>
                <p><strong>Narudžba:</strong> ${data.orderNumber}</p>
                <p><strong>Iznos:</strong> €${data.refundAmount.toFixed(2)}</p>
                <p><strong>Razlog:</strong> ${data.reason}</p>
                <p style="margin-top: 15px; font-size: 14px; color: #666;">
                  Novac bi trebao biti vraćen na vašu karticu u roku od 3-5 radnih dana, ovisno o vašoj banci.
                </p>
              </div>

              <p>Ako imaš dodatnih pitanja ili trebam dodatnu pomoć, slobodno nas kontaktiraj.</p>
            </div>

            <div class="footer">
              <p>© 2024 Biraj.hr - Marketplace za oglase. Sva prava zadržana.</p>
              <p>Ako imaš pitanja, kontaktiraj nas na <a href="mailto:support@biraj.hr">support@biraj.hr</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const result = await resend.emails.send({
        from: "noreply@biraj.hr",
        to: data.email,
        subject: `Povraćaj novca - Potvrda #${data.orderNumber}`,
        html,
      });

      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error("Email send error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to send email" };
    }
  });
