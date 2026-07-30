import { Badge, StatusTag } from '../ui';
import { ExecutionProgress } from './ExecutionProgress';

interface RuntimeHeaderProps {
  status: string;
  progress: number;
  nodeCount: number;
  activeNode?: string;
}

export function RuntimeHeader({ status, progress, nodeCount, activeNode }: RuntimeHeaderProps) {
  return (
    <div className="grid gap-4 rounded-lg border border-line bg-white p-4 shadow-sm xl:grid-cols-[1fr_280px]">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-ink">Execution Explorer</h1>
          <StatusTag status={status} />
        </div>
        <p className="mt-1 text-sm text-muted">
          Inspect the current Agent run as a graph, timeline and structured step details.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{nodeCount} nodes</Badge>
          <Badge>active {activeNode ?? 'waiting'}</Badge>
        </div>
      </div>
      <ExecutionProgress value={progress} />
    </div>
  );
}
