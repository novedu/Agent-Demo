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
  const mainNodes = nodes.filter((node) => node.kind !== 'memory');
  const supportNodes = nodes.filter((node) => node.kind === 'memory');

  return (
    <Panel
      title="Graph View"
      description="Planner to tools to review, evaluation and answer."
      className="h-full"
      bodyClassName="h-[calc(100%-64px)] overflow-y-auto"
    >
      <div className="grid gap-3">
        {mainNodes.map((node, index) => (
          <div key={node.id}>
            <ExecutionNode node={node} active={node.id === activeNodeId} onSelect={onSelectNode} />
            {index < mainNodes.length - 1 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 28, opacity: 1 }}
                transition={{ duration: 0.18, delay: index * 0.015 }}
                className="mx-auto flex w-px items-center justify-center bg-line"
              >
                <span className="mt-7 h-2 w-2 rounded-full bg-lineStrong" />
              </motion.div>
            )}
          </div>
        ))}
        {supportNodes.length > 0 && (
          <div className="mt-2 rounded-lg border border-dashed border-lineStrong bg-panel p-3">
            <div className="mb-3 text-xs font-semibold uppercase tracking-normal text-muted">
              Support Nodes
            </div>
            <div className="grid gap-3">
              {supportNodes.map((node) => (
                <ExecutionNode
                  key={node.id}
                  node={node}
                  active={node.id === activeNodeId}
                  onSelect={onSelectNode}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
