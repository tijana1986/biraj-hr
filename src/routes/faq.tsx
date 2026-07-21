import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { fetchFAQItems } from "@/lib/cms.functions";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Česta pitanja — Biraj.HR" },
      { name: "description", content: "Odgovori na najčešća pitanja o korištenju Biraj.HR marketplacea." },
      { property: "og:title", content: "Česta pitanja — Biraj.HR" },
    ],
  }),
  component: FAQ,
});

function FAQ() {
  const fetchFn = useServerFn(fetchFAQItems);

  const { data: faqGroups = {}, isLoading } = useQuery({
    queryKey: ["faq-items"],
    queryFn: () => fetchFn(),
  });

  const sections = Object.keys(faqGroups).sort();

  if (isLoading) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <Breadcrumbs items={[{ label: "Početna", to: "/" }, { label: "Česta pitanja" }]} />
          <h1 className="mt-4 font-display text-5xl font-semibold">Česta pitanja</h1>
          <p className="mt-3 text-muted-foreground">Odgovori na najčešća pitanja o korištenju Biraj.HR-a.</p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-16">
        {sections.map((section) => (
          <div key={section} className="mb-10">
            <h2 className="font-display text-2xl font-semibold">{section}</h2>
            <Accordion type="single" collapsible className="mt-3">
              {(faqGroups[section] || []).map((item: any, i: number) => (
                <AccordionItem key={item.id} value={`${section}-${i}`}>
                  <AccordionTrigger className="text-left text-base font-medium">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </section>
    </SiteShell>
  );
}
