import { ExecutionGraph } from './ExecutionGraph';
import type { ExecutionNodeRecord } from './execution-model';
import type {
  RuntimeDependencyEdge,
  RuntimeObject,
} from '../../features/agent-console/runtime-object-model';

interface ExecutionExplorerProps {
  nodes: ExecutionNodeRecord[];
  runtimeObjects?: RuntimeObject[];
  dependencyEdges?: RuntimeDependencyEdge[];
  activeNodeId?: string;
  onSelectNode: (node: ExecutionNodeRecord) => void;
}

export function ExecutionExplorer({
  nodes,
  runtimeObjects,
  dependencyEdges,
  activeNodeId,
  onSelectNode,
}: ExecutionExplorerProps) {
  return (
    <ExecutionGraph
      nodes={nodes}
      runtimeObjects={runtimeObjects}
      dependencyEdges={dependencyEdges}
      activeNodeId={activeNodeId}
      onSelectNode={onSelectNode}
    />
  );
}
