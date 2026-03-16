'use client';

import { motion } from "framer-motion";

interface TimelineItem {
  period: string;
  title: string;
  description: string;
}

interface WearTimelineProps {
  items: TimelineItem[];
}

export function WearTimeline({ items }: WearTimelineProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--hb-border)]" />
      
      <div className="space-y-8">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-12"
          >
            {/* Dot */}
            <div className="absolute left-2 top-2 w-4 h-4 rounded-full bg-[var(--hb-ink)] border-2 border-[var(--hb-paper)]" />
            
            <div>
              <p className="text-sm font-script text-[var(--hb-smoke)] mb-1">
                {item.period}
              </p>
              <h4 className="font-serif text-lg mb-2">{item.title}</h4>
              <p className="text-[var(--hb-smoke)] text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

