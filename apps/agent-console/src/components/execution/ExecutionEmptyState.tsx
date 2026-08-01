import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { AgentIcon, SparkIcon } from '../ui';

interface ExecutionEmptyStateProps {
  onStart: () => void;
}

const suggestions = [
  { title: '分析销售下降原因', detail: '分析销售数据并生成报告' },
  { title: '总结今天的业务周', detail: '汇总日常指标和业务进展' },
  { title: 'Travel Planner', detail: '规划多城市旅行行程' },
  { title: 'RAG QA', detail: '基于知识库回答问题' },
];

export function ExecutionEmptyState({ onStart }: ExecutionEmptyStateProps) {
  return (
    <motion.div
      className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-6">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">👋</span>
          <h2 className="text-base font-semibold text-ink">Welcome to Agent Studio</h2>
        </div>
        <p className="max-w-md text-center text-xs leading-5 text-muted">
          Start a task from the suggestions below or describe a goal in natural language.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {suggestions.map((s) => (
            <SuggestionChip key={s.title} title={s.title} detail={s.detail} onClick={onStart} />
          ))}
        </div>
      </div>

      {/* Graph placeholder */}
      <div className="border-t border-line bg-slate-50/50">
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <div className="text-xs font-semibold text-ink">Runtime Graph</div>
          <div className="text-[10px] text-muted">Execution & dependency graph</div>
        </div>
        <div className="flex h-full min-h-[80px] items-center justify-center p-4">
          <p className="text-xs text-muted">
            Waiting for task · The runtime dependency graph will appear here
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SuggestionChip({
  title,
  detail,
  onClick,
}: {
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start gap-0.5 rounded-lg border border-line bg-panel px-3 py-2 text-left transition-colors hover:border-lineStrong hover:bg-white"
    >
      <span className="text-xs font-semibold text-ink">{title}</span>
      <span className="text-[10px] text-muted">{detail}</span>
    </button>
  );
}