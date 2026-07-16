import { createFileRoute } from "@tanstack/react-router";
import { generateListingOGImage } from "@/lib/og-image.functions";
import { supabase } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/og/listing/$id")({
  async beforeLoad({ params }) {
    try {
      // Fetch listing details
      const { data: listing } = await supabase
        .from("listings")
        .select("title, description, price_eur, category_slug")
        .eq("id", params.id)
        .single();

      if (!listing) {
        return {
          statusCode: 404,
          body: "Listing not found",
        };
      }

      // Generate OG image
      const imageData = await generateListingOGImage({
        title: listing.title,
        description: listing.description?.substring(0, 100),
        category: listing.category_slug,
        price: `€${listing.price_eur}`,
      });

      if (!imageData.success) {
        throw new Error(imageData.error);
      }

      return {
        statusCode: 200,
        body: imageData.buffer,
        contentType: "image/png",
        headers: {
          "Cache-Control": "public, max-age=86400", // Cache for 24 hours
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
