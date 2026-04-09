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
          className="border-b border-[var(--hb-border)] border-t-0 border-l-0 border-r-0"
        >
          <AccordionTrigger className="font-serif text-lg text-left hover:text-[var(--hb-accent)] hover:no-underline py-4 [&>svg]:text-[var(--hb-smoke)]">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-[var(--hb-smoke)] leading-relaxed pb-4">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

