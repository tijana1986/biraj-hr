import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase } from "@/integrations/supabase/client.server";

// KYC Schemas
const kycSubmissionSchema = z.object({
  id_type: z.enum(["passport", "id_card", "driver_license"]),
  id_number: z.string().min(5).max(50),
  full_name: z.string().min(3).max(100),
  date_of_birth: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date"),
  country: z.string().length(2), // ISO country code
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(50),
  postal_code: z.string().min(2).max(20),
});

const idUploadSchema = z.object({
  file_path: z.string().url().or(z.string().startsWith("/")),
  file_type: z.enum(["front", "back"]),
});

// Submit KYC
export const submitKYCData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => kycSubmissionSchema.parse(input))
  .handler(async ({ data, context }) => {
    try {
      // Check if already submitted
      const { data: existing } = await supabase
        .from("kyc_submissions")
        .select("id, status")
        .eq("user_id", context.userId)
        .single();

      if (existing && existing.status === "approved") {
        throw new Error("KYC je već potvrđen za ovaj račun.");
      }

      if (existing && existing.status === "pending") {
        throw new Error("KYC je već poslano na provjeru. Molimo čekajte.");
      }

      // Create KYC submission
      const { data: submission, error } = await supabase
        .from("kyc_submissions")
        .insert({
          user_id: context.userId,
          id_type: data.id_type,
          id_number: data.id_number,
          full_name: data.full_name,
          date_of_birth: data.date_of_birth,
          country: data.country,
          address: data.address,
          city: data.city,
          postal_code: data.postal_code,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        submission_id: submission.id,
        message: "KYC podatci su poslani na provjeru",
      };
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : "Greška pri slanju KYC");
    }
  });

// Get KYC status
export const getKYCStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const { data, error } = await supabase
        .from("kyc_submissions")
        .select("id, status, created_at, verified_at, rejection_reason")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return {
        status: data?.status || "not_submitted",
        submission: data,
      };
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : "Greška pri dohvatu KYC statusa");
    }
  });

// Upload ID documents
export const uploadIDDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => idUploadSchema.parse(input))
  .handler(async ({ data, context }) => {
    try {
      const { error } = await supabase
        .from("kyc_id_documents")
        .insert({
          user_id: context.userId,
          file_path: data.file_path,
          document_type: data.file_type,
        });

      if (error) throw error;

      return { success: true, message: "Dokument je uploadiran" };
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : "Greška pri uploadu dokumenta");
    }
  });

// Calculate seller trust score
export const calculateTrustScore = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email_verified, kyc_verified, reviews_count, avg_rating, listings_created, violation_count")
        .eq("id", context.userId)
        .single();

      if (!profile) {
        return { score: 0, level: "unverified", badges: [] };
      }

      let score = 0;
      const badges: string[] = [];

      // Email verification: +20 points
      if (profile.email_verified) {
        score += 20;
        badges.push("email_verified");
      }

      // KYC verification: +30 points
      if (profile.kyc_verified) {
        score += 30;
        badges.push("kyc_verified");
      }

      // Reviews: +20 points (max at 5+ reviews with 4.5+ rating)
      if (profile.reviews_count && profile.reviews_count > 0) {
        const reviewScore = Math.min(20, Math.floor((profile.reviews_count / 5) * 20));
        score += reviewScore;
        if (profile.avg_rating && profile.avg_rating >= 4.5) {
          badges.push("highly_rated");
        }
      }

      // Active seller: +15 points (10+ listings)
      if (profile.listings_created && profile.listings_created >= 10) {
        score += 15;
        badges.push("active_seller");
      }

      // Violations: -25 points per violation
      if (profile.violation_count && profile.violation_count > 0) {
        score -= profile.violation_count * 25;
      }

      // Cap score between 0 and 100
      score = Math.max(0, Math.min(100, score));

      // Determine level
      let level = "unverified";
      if (score >= 80) level = "trusted";
      else if (score >= 50) level = "verified";
      else if (score >= 20) level = "partial";

      return {
        score,
        level,
        badges,
        breakdown: {
          email: profile.email_verified ? 20 : 0,
          kyc: profile.kyc_verified ? 30 : 0,
          reviews: profile.reviews_count ? Math.min(20, Math.floor((profile.reviews_count / 5) * 20)) : 0,
          seller: profile.listings_created && profile.listings_created >= 10 ? 15 : 0,
          violations: profile.violation_count ? -(profile.violation_count * 25) : 0,
        },
      };
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : "Greška pri izračunu trust score-a");
    }
  });
