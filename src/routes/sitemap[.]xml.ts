import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/mock/data";

const BASE_URL = "https://biraj.com.hr";

interface Entry {
  path: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticEntries: Entry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/browse", changefreq: "daily", priority: "0.9" },
          { path: "/pretraga", changefreq: "weekly", priority: "0.7" },
          { path: "/cjenik", changefreq: "monthly", priority: "0.6" },
          { path: "/o-nama", changefreq: "monthly", priority: "0.5" },
          { path: "/kontakt", changefreq: "monthly", priority: "0.5" },
          { path: "/faq", changefreq: "monthly", priority: "0.5" },
          { path: "/uvjeti", changefreq: "yearly", priority: "0.3" },
          { path: "/privatnost", changefreq: "yearly", priority: "0.3" },
        ];

        const categoryEntries: Entry[] = CATEGORIES.flatMap((c) => [
          { path: `/kategorija/${c.slug}`, changefreq: "daily", priority: "0.8" },
          ...c.subcategories.map((s) => ({
            path: `/kategorija/${c.slug}/${s.slug}`,
            changefreq: "daily" as const,
            priority: "0.7",
          })),
        ]);

        const all = [...staticEntries, ...categoryEntries];

        const urls = all
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n` +
              (e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>\n` : "") +
              (e.priority ? `    <priority>${e.priority}</priority>\n` : "") +
              `  </url>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
