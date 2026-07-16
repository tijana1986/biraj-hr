import { server$ } from "@tanstack/react-start";
import sharp from "sharp";

interface OGImageOptions {
  title: string;
  description?: string;
  category?: string;
  price?: string;
  image?: Buffer | null;
}

export const generateListingOGImage = server$(async (props: OGImageOptions) => {
  try {
    const width = 1200;
    const height = 630;
    const padding = 40;

    // Create SVG template
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background gradient -->
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a2647;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2d3e5f;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bg)"/>

        <!-- Accent bar -->
        <rect width="${width}" height="8" fill="#d4a574"/>

        <!-- Logo/Brand -->
        <text x="${padding}" y="50" font-family="system-ui" font-size="28" font-weight="bold" fill="#d4a574">
          Biraj.HR
        </text>

        <!-- Category badge -->
        ${
          props.category
            ? `
          <rect x="${padding}" y="80" width="200" height="40" rx="20" fill="#d4a574" opacity="0.2"/>
          <text x="${padding + 20}" y="108" font-family="system-ui" font-size="16" font-weight="600" fill="#d4a574">
            ${props.category}
          </text>
        `
            : ""
        }

        <!-- Title -->
        <text x="${padding}" y="${150}" font-family="system-ui" font-size="48" font-weight="bold" fill="#ffffff"
              max-length="${width - padding * 2}">
          ${props.title.substring(0, 30)}${props.title.length > 30 ? "..." : ""}
        </text>

        <!-- Description -->
        ${
          props.description
            ? `
          <text x="${padding}" y="280" font-family="system-ui" font-size="20" fill="#d4d4d4" max-length="${width - padding * 2}">
            ${props.description.substring(0, 60)}${props.description.length > 60 ? "..." : ""}
          </text>
        `
            : ""
        }

        <!-- Price -->
        ${
          props.price
            ? `
          <text x="${padding}" y="400" font-family="system-ui" font-size="36" font-weight="bold" fill="#d4a574">
            ${props.price}
          </text>
        `
            : ""
        }

        <!-- Bottom accent -->
        <rect y="${height - 8}" width="${width}" height="8" fill="#d4a574"/>
      </svg>
    `;

    // Convert SVG to image
    const image = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    return {
      success: true,
      buffer: image,
      contentType: "image/png",
    };
  } catch (error) {
    console.error("OG image generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate OG image",
    };
  }
});

export const generateCategoryOGImage = server$(async (props: {
  categoryName: string;
  subcategoryCount: number;
}) => {
  try {
    const width = 1200;
    const height = 630;
    const padding = 40;

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#d4a574;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#c7935d;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bg)"/>

        <!-- Logo -->
        <text x="${padding}" y="80" font-family="system-ui" font-size="32" font-weight="bold" fill="#1a2647">
          Biraj.HR
        </text>

        <!-- Category name -->
        <text x="${padding}" y="200" font-family="system-ui" font-size="56" font-weight="bold" fill="#1a2647">
          ${props.categoryName}
        </text>

        <!-- Subcategory count -->
        <text x="${padding}" y="300" font-family="system-ui" font-size="24" fill="#1a2647" opacity="0.8">
          ${props.subcategoryCount} podkategorija dostupno
        </text>

        <!-- CTA -->
        <text x="${padding}" y="450" font-family="system-ui" font-size="20" fill="#1a2647" opacity="0.6">
          Pregleda sve oglase →
        </text>
      </svg>
    `;

    const image = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    return {
      success: true,
      buffer: image,
      contentType: "image/png",
    };
  } catch (error) {
    console.error("Category OG image generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate OG image",
    };
  }
});

export const generateSellerOGImage = server$(async (props: {
  sellerName: string;
  trustLevel: string;
  rating: number;
}) => {
  try {
    const width = 1200;
    const height = 630;
    const padding = 40;

    const stars = "⭐".repeat(Math.floor(props.rating));

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a2647;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2d3e5f;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bg)"/>

        <!-- Logo -->
        <text x="${padding}" y="80" font-family="system-ui" font-size="32" font-weight="bold" fill="#d4a574">
          Biraj.HR
        </text>

        <!-- Seller name -->
        <text x="${padding}" y="200" font-family="system-ui" font-size="56" font-weight="bold" fill="#ffffff">
          ${props.sellerName}
        </text>

        <!-- Trust badge -->
        <rect x="${padding}" y="250" width="300" height="60" rx="30" fill="#d4a574" opacity="0.2"/>
        <text x="${padding + 30}" y="290" font-family="system-ui" font-size="24" font-weight="600" fill="#d4a574">
          ${props.trustLevel}
        </text>

        <!-- Rating -->
        <text x="${padding}" y="400" font-family="system-ui" font-size="28" fill="#d4a574">
          ${stars} (${props.rating}/5)
        </text>
      </svg>
    `;

    const image = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    return {
      success: true,
      buffer: image,
      contentType: "image/png",
    };
  } catch (error) {
    console.error("Seller OG image generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate OG image",
    };
  }
});
