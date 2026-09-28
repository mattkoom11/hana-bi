'use client';

import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

export function FAQAccordion({ items, className }: FAQAccordionProps) {
  return (
    <Accordion type="single" collapsible className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="border-b border-[var(--hb-dark-border)] border-t-0 border-l-0 border-r-0 last:border-b"
        >
          <AccordionTrigger className="font-display italic font-light text-lg text-left text-[var(--hb-on-dark)] hover:no-underline py-4 [&>svg]:text-[var(--hb-dark-muted)]">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-[var(--hb-dark-muted)] leading-relaxed pb-4">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

