import { motion } from 'framer-motion';

interface InspectorEmptyProps {
  title: string;
  description: string;
}

export function InspectorEmpty({ title, description }: InspectorEmptyProps) {
  return (
    <motion.div
      className="rounded-md border border-dashed border-lineStrong bg-panel px-3 py-5 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-white text-xs font-bold text-muted">
        --
      </div>
      <div className="mt-2 text-xs font-semibold text-ink">{title}</div>
      <p className="mt-1 text-[11px] leading-5 text-muted">{description}</p>
    </motion.div>
  );
}
