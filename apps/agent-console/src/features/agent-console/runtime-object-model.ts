import type { ExecutionNodeRecord, ExecutionNodeStatus } from '../../components/execution/execution-model';

export type RuntimeObjectType =
  | 'planner'
  | 'workflow'
  | 'tool'
  | 'knowledge'
  | 'memory'
  | 'reflection'
  | 'evaluation'
  | 'answer';

export interface RuntimeObject {
  id: string;
  type: RuntimeObjectType;
  title: string;
  status: ExecutionNodeStatus;
  summary: string;
  input?: unknown;
  output?: unknown;
  arguments?: unknown;
  reasoning?: unknown;
  metadata?: Record<string, unknown>;
  trace?: unknown;
  duration?: number;
  startTime?: number;
  endTime?: number;
  tokenCount?: number;
  retryCount?: number;
  cost?: number;
  sourceNode: ExecutionNodeRecord;
}

export interface RuntimeDependencyEdge {
  id: string;
  from: string;
  to: string;
  status: ExecutionNodeStatus;
  label: string;
}

export function buildRuntimeObjects(nodes: ExecutionNodeRecord[]): RuntimeObject[] {
  return nodes.map((node) => ({
    id: node.id,
    type: toRuntimeObjectType(node.kind),
    title: node.component,
    status: node.status,
    summary: node.summary,
    input: node.input,
    output: node.output,
    arguments: node.arguments,
    reasoning: getReasoningPayload(node),
    metadata: node.metadata,
    trace: node.trace,
    duration: node.duration,
    startTime: node.startTime,
    endTime: node.endTime,
    tokenCount: readNumber(node.metadata, 'tokenCount'),
    retryCount: readNumber(node.metadata, 'retryCount'),
    cost: readNumber(node.metadata, 'cost'),
    sourceNode: node,
  }));
}

export function buildRuntimeDependencyEdges(objects: RuntimeObject[]): RuntimeDependencyEdge[] {
  const byType = new Map<RuntimeObjectType, RuntimeObject[]>();
  objects.forEach((object) => {
    byType.set(object.type, [...(byType.get(object.type) ?? []), object]);
  });

  const planner = first(byType, 'planner');
  const workflow = first(byType, 'workflow');
  const knowledge = first(byType, 'knowledge');
  const memory = first(byType, 'memory');
  const reflection = first(byType, 'reflection');
  const evaluation = first(byType, 'evaluation');
  const answer = first(byType, 'answer');
  const tools = byType.get('tool') ?? [];
  const edges: RuntimeDependencyEdge[] = [];

  if (planner && workflow) addEdge(edges, planner, workflow, 'plan');
  if (planner && knowledge) addEdge(edges, planner, knowledge, 'context');
  tools.forEach((tool) => {
    if (workflow) addEdge(edges, workflow, tool, 'execute');
    else if (planner) addEdge(edges, planner, tool, 'execute');
  });
  tools.forEach((tool) => {
    if (memory) addEdge(edges, tool, memory, 'write');
    if (reflection) addEdge(edges, tool, reflection, 'result');
  });
  if (knowledge && reflection) addEdge(edges, knowledge, reflection, 'evidence');
  if (memory && reflection) addEdge(edges, memory, reflection, 'memory');
  if (reflection && evaluation) addEdge(edges, reflection, evaluation, 'judge');
  if (evaluation && answer) addEdge(edges, evaluation, answer, 'quality');
  if (!evaluation && reflection && answer) addEdge(edges, reflection, answer, 'answer');
  if (!reflection && tools.length > 0 && answer) addEdge(edges, tools[tools.length - 1], answer, 'answer');
  if (planner && answer && edges.length === 0) addEdge(edges, planner, answer, 'answer');

  return edges;
}

export function getCurrentRuntimeObjectId(objects: RuntimeObject[]): string | undefined {
  return (
    objects.find((object) => object.status === 'running')?.id ??
    [...objects].reverse().find((object) => object.status === 'success')?.id ??
    objects.find((object) => object.status === 'waiting')?.id
  );
}

function addEdge(
  edges: RuntimeDependencyEdge[],
  from: RuntimeObject,
  to: RuntimeObject,
  label: string,
): void {
  edges.push({
    id: `${from.id}__${to.id}`,
    from: from.id,
    to: to.id,
    status: getEdgeStatus(from.status, to.status),
    label,
  });
}

function getEdgeStatus(from: ExecutionNodeStatus, to: ExecutionNodeStatus): ExecutionNodeStatus {
  if (from === 'failed' || to === 'failed') return 'failed';
  if (from === 'running' || to === 'running') return 'running';
  if (from === 'success' && to === 'success') return 'success';
  if (from === 'cancelled' || to === 'cancelled') return 'cancelled';
  return 'waiting';
}

function first(
  byType: Map<RuntimeObjectType, RuntimeObject[]>,
  type: RuntimeObjectType,
): RuntimeObject | undefined {
  return byType.get(type)?.[0];
}

function toRuntimeObjectType(kind: ExecutionNodeRecord['kind']): RuntimeObjectType {
  if (kind === 'rag') return 'knowledge';
  if (kind === 'llm') return 'answer';
  return kind;
}

function getReasoningPayload(node: ExecutionNodeRecord): unknown {
  if (node.metadata && 'reasoning' in node.metadata) return node.metadata.reasoning;
  if (node.kind === 'reflection') return node.output;
  if (node.kind === 'evaluation') return node.metadata;
  return undefined;
}

function readNumber(metadata: Record<string, unknown> | undefined, key: string): number | undefined {
  const value = metadata?.[key];
  return typeof value === 'number' ? value : undefined;
}
