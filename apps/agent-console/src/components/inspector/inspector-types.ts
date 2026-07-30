import type {
  AgentEvent,
  AgentStateSnapshot,
  CitationRecord,
  EvaluationResult,
  MemoryRecord,
  Plan,
  ToolCallRecord,
} from '../../types/agent';
import type { ExecutionNodeRecord } from '../execution/execution-model';

export interface RuntimeInspectorProps {
  currentNode?: ExecutionNodeRecord;
  nodes: ExecutionNodeRecord[];
  events: AgentEvent[];
  plan: Plan | null;
  state?: AgentStateSnapshot;
  memory: MemoryRecord[];
  citations: CitationRecord[];
  evaluation?: EvaluationResult;
  tools: ToolCallRecord[];
  status: string;
  isLoading: boolean;
}

export interface InspectorSectionProps {
  isLoading: boolean;
}
