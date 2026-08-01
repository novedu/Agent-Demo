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
  variant?: 'card' | 'flush';
}

export function Accordion({ items, defaultOpenId, focusId, variant = 'card' }: AccordionProps) {
  const [openId, setOpenId] = useState(defaultOpenId ?? items[0]?.id);
  const isFlush = variant === 'flush';

  useEffect(() => {
    if (focusId) setOpenId(focusId);
  }, [focusId]);

  return (
    <div className={isFlush ? 'divide-y divide-line border-y border-line' : 'space-y-3'}>
      {items.map((item) => {
        const isOpen = item.id === openId;

        return (
          <section
            key={item.id}
            className={classNames(
              'overflow-hidden bg-white',
              isFlush ? '' : 'rounded-xl border border-line',
            )}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? '' : item.id)}
              className={classNames(
                'flex w-full cursor-pointer items-center justify-between gap-4 text-left transition-colors duration-200 hover:bg-panel focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent/20',
                isFlush ? 'min-h-10 px-0' : 'min-h-11 px-4',
              )}
            >
              <span className="truncate text-sm font-semibold text-ink">{item.title}</span>
              <span className="flex items-center gap-2 text-xs text-muted">
                {item.meta}
                <span
                  aria-hidden="true"
                  className={classNames('font-mono transition-transform duration-200', isOpen && 'rotate-180')}
                >
                  ^
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
                  <div className={isFlush ? 'py-3' : 'p-4'}>{item.children}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}
    </div>
  );
}
