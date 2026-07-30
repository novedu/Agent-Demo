import { ExecutionGraph } from './ExecutionGraph';
import type { ExecutionNodeRecord } from './execution-model';

interface ExecutionExplorerProps {
  nodes: ExecutionNodeRecord[];
  activeNodeId?: string;
  onSelectNode: (node: ExecutionNodeRecord) => void;
}

export function ExecutionExplorer({ nodes, activeNodeId, onSelectNode }: ExecutionExplorerProps) {
  return <ExecutionGraph nodes={nodes} activeNodeId={activeNodeId} onSelectNode={onSelectNode} />;
}
