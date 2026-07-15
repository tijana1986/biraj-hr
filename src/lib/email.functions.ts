import { server$ } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client.server";

export const sendVerificationEmail = server$(async (props: {
  email: string;
  verificationToken: string;
  userName?: string;
}) => {
  try {
    // In production, integrate with Resend or SendGrid
    // For now, we'll just return success
    // Email content would contain: https://biraj.hr/verify-email?token=verificationToken

    console.log(`Email verification sent to ${props.email} with token: ${props.verificationToken}`);

    return {
      success: true,
      message: `Verification email sent to ${props.email}`,
    };
  } catch (error) {
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
