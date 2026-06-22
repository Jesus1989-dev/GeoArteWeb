"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Item = { id: string; question: string; answer: string };

type FaqAccordionProps = {
  items: readonly Item[];
  defaultOpenId?: string;
};

export function FaqAccordion({ items, defaultOpenId }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(
    defaultOpenId ?? items[0]?.id ?? null,
  );

  return (
    <div className="divide-y divide-gray-200">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-geo-navy transition hover:text-geo-pink"
              aria-expanded={isOpen}
            >
              <span className="pr-2">{item.question}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-geo-muted transition-transform",
                  isOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            {isOpen && (
              <p className="pb-4 text-sm leading-relaxed text-geo-muted">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
