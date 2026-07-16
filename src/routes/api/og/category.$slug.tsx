import { createFileRoute } from "@tanstack/react-router";
import { generateCategoryOGImage } from "@/lib/og-image.functions";
import { CATEGORIES } from "@/lib/mock/data";

export const Route = createFileRoute("/api/og/category/$slug")({
  async beforeLoad({ params }) {
    try {
      // Find category from mock data
      const category = CATEGORIES.find((c) => c.slug === params.slug);

      if (!category) {
        return {
          statusCode: 404,
          body: "Category not found",
        };
      }

      // Generate OG image
      const imageData = await generateCategoryOGImage({
        categoryName: category.name,
        subcategoryCount: category.subcategories.length,
      });

      if (!imageData.success) {
        throw new Error(imageData.error);
      }

      return {
        statusCode: 200,
        body: imageData.buffer,
        contentType: "image/png",
        headers: {
          "Cache-Control": "public, max-age=604800", // Cache for 7 days
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
