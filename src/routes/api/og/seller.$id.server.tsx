import { createFileRoute } from "@tanstack/react-router";
import { generateSellerOGImage } from "@/lib/og-image.functions";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/og/seller/$id")({
  async beforeLoad({ params }) {
    try {
      // Fetch seller details
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name, avg_rating, trust_score")
        .eq("id", params.id)
        .single();

      if (!profile) {
        return {
          statusCode: 404,
          body: "Seller not found",
        };
      }

      // Determine trust level
      const score = profile.trust_score || 0;
      let trustLevel = "Nepotvrdeno";
      if (score >= 80) trustLevel = "Trusted Seller";
      else if (score >= 50) trustLevel = "Potvrđeno";
      else if (score >= 20) trustLevel = "Djelomično potvrđeno";

      // Generate OG image
      const imageData = await generateSellerOGImage({
        sellerName: profile.full_name || "Prodavač",
        trustLevel,
        rating: profile.avg_rating || 0,
      });

      if (!imageData.success) {
        throw new Error(imageData.error);
      }

      return {
        statusCode: 200,
        body: imageData.buffer,
        contentType: "image/png",
        headers: {
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
          "Content-Type": "image/png",
        },
      };
    } catch (error) {
      console.error("OG image generation failed:", error);
      return {
        statusCode: 500,
        body: "Failed to generate image",
      };
    }
  },
  component: () => null,
});
