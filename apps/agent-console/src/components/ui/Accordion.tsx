import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { classNames } from './classNames';

export interface AccordionItem {
  id: string;
  title: string;
  meta?: ReactNode;
  children: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
}

export function Accordion({ items, defaultOpenId }: AccordionProps) {
  const [openId, setOpenId] = useState(defaultOpenId ?? items[0]?.id);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = item.id === openId;

        return (
          <section key={item.id} className="overflow-hidden rounded-lg border border-line bg-white">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? '' : item.id)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-panel focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent/20"
            >
              <span className="text-sm font-semibold text-ink">{item.title}</span>
              <span className="flex items-center gap-2 text-xs text-muted">
                {item.meta}
                <span
                  aria-hidden="true"
                  className={classNames('transition-transform', isOpen && 'rotate-180')}
                >
                  v
                </span>
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="overflow-hidden border-t border-line"
                >
                  <div className="p-3">{item.children}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}
    </div>
  );
}
