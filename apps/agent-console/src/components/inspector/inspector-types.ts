import type {
  AgentEvent,
  AgentStateSnapshot,
  CitationRecord,
  EvaluationResult,
  MemoryRecord,
  Plan,
  ToolCallRecord,
} from '../../types/agent';
import type { ExecutionNodeRecord, FocusedRuntimeObject } from '../execution/execution-model';
import type { RuntimeOverview } from '../../features/agent-console/runtime-overview';
import type { RuntimeObject } from '../../features/agent-console/runtime-object-model';

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
  runtimeOverview: RuntimeOverview;
  runtimeObjects: RuntimeObject[];
  focusedObject?: FocusedRuntimeObject;
  focusSection?: string;
  highlightedCitationId?: string;
  highlightedMemoryId?: string;
  highlightedTraceId?: string;
  onMemorySelect?: (memory: MemoryRecord) => void;
  onEvaluationTrace?: () => void;
  onCitationSelect?: (citation: CitationRecord) => void;
  onTraceSelect?: (event: AgentEvent) => void;
}

export interface InspectorSectionProps {
  isLoading: boolean;
}
