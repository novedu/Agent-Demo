import { motion } from 'framer-motion';
import { Panel } from '../ui';
import { ExecutionNode } from './ExecutionNode';
import type { ExecutionNodeRecord } from './execution-model';

interface ExecutionGraphProps {
  nodes: ExecutionNodeRecord[];
  activeNodeId?: string;
  onSelectNode: (node: ExecutionNodeRecord) => void;
}

export function ExecutionGraph({ nodes, activeNodeId, onSelectNode }: ExecutionGraphProps) {
  const graphNodes = nodes;
  const pathHeight = Math.max(0, graphNodes.length - 1) * 148;

  return (
    <Panel
      title="Runtime Graph"
      description="Read-only runtime path from planning to final answer."
      className="h-full"
      bodyClassName="h-[calc(100%-64px)] overflow-y-auto"
    >
      <div className="relative mx-auto max-w-2xl">
        <svg
          className="pointer-events-none absolute left-1/2 top-14 hidden h-full w-16 -translate-x-1/2 text-lineStrong md:block"
          viewBox={`0 0 64 ${Math.max(1, pathHeight)}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <motion.path
            d={`M32 0 V${pathHeight}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.2 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          />
        </svg>

        <div className="relative grid gap-7">
          {graphNodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: index * 0.025, ease: 'easeOut' }}
              className="relative"
            >
              {index > 0 && (
                <div className="absolute -top-5 left-1/2 hidden h-3 w-3 -translate-x-1/2 rounded-full border border-lineStrong bg-white md:block" />
              )}
              <ExecutionNode
                node={node}
                active={node.id === activeNodeId}
                onSelect={onSelectNode}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
