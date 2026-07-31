import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
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
  focusId?: string;
}

export function Accordion({ items, defaultOpenId, focusId }: AccordionProps) {
  const [openId, setOpenId] = useState(defaultOpenId ?? items[0]?.id);

  useEffect(() => {
    if (focusId) setOpenId(focusId);
  }, [focusId]);

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = item.id === openId;

        return (
          <section key={item.id} className="overflow-hidden rounded-xl border border-line bg-white">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? '' : item.id)}
              className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 px-5 text-left transition-colors duration-200 hover:bg-panel focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent/20"
            >
              <span className="truncate text-sm font-semibold text-ink">{item.title}</span>
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
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden border-t border-line"
                >
                  <div className="p-4">{item.children}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}
    </div>
  );
}
