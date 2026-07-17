import { server$ } from "@tanstack/react-start/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = server$(async (props: {
  email: string;
  verificationToken: string;
  userName?: string;
}) => {
  try {
    const verificationUrl = `${process.env.VITE_APP_URL || "https://biraj.hr"}/provjeri-email?token=${props.verificationToken}`;

    const result = await resend.emails.send({
      from: "noreply@biraj.hr",
      to: props.email,
      subject: "Potvrdi svoj e-mail na Biraj.HR",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a2647 0%, #2d3e5f 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Biraj.HR</h1>
          </div>
          <div style="padding: 40px; background: #f9fafb;">
            <p style="color: #1f2937; font-size: 16px; margin-bottom: 24px;">
              Pozdrav${props.userName ? `, ${props.userName}` : ""}!
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
      `,
    });

    if (result.error) {
      throw result.error;
    }

    return {
      success: true,
      message: `Verification email sent to ${props.email}`,
    };
  } catch (error) {
    console.error("Resend error:", error);
    throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : String(error)}`);
  }
});

export const verifyEmail = server$(async (props: {
  token: string;
  userId: string;
}) => {
  try {
    const { data, error } = await supabase
      .from("email_verifications")
      .select("*")
      .eq("token", props.token)
      .eq("user_id", props.userId)
      .single();

    if (error || !data) {
      throw new Error("Invalid or expired verification token");
    }

    if (data.verified_at) {
      throw new Error("Email already verified");
    }

    // Update email_verifications table
    const { error: updateError } = await supabase
      .from("email_verifications")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", data.id);

    if (updateError) throw updateError;

    // Update user profile to mark email as verified
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ email_verified: true })
      .eq("id", props.userId);

    if (profileError) throw profileError;

    return {
      success: true,
      message: "Email verified successfully",
    };
  } catch (error) {
    throw new Error(`Email verification failed: ${error instanceof Error ? error.message : String(error)}`);
  }
});

export const resendVerificationEmail = server$(async (props: {
  userId: string;
  email: string;
}) => {
  try {
    // Check if already verified
    const { data: profile } = await supabase
      .from("profiles")
      .select("email_verified")
      .eq("id", props.userId)
      .single();

    if (profile?.email_verified) {
      throw new Error("Email is already verified");
    }

    // Generate new token
    const token = crypto.getRandomValues(new Uint8Array(32)).join(":");

    // Update or create email verification record
    const { error } = await supabase
      .from("email_verifications")
      .upsert(
        {
          user_id: props.userId,
          token,
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) throw error;

    // Send email (placeholder)
    await sendVerificationEmail({
      email: props.email,
      verificationToken: token,
    });

    return {
      success: true,
      message: "Verification email resent",
    };
  } catch (error) {
    throw new Error(`Failed to resend verification email: ${error instanceof Error ? error.message : String(error)}`);
  }
});
