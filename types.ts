export type MessageRole = 'user' | 'assistant' | 'tool';
export type MessageStatus = 'pending' | 'streaming' | 'success' | 'error';

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  success: boolean;
  toolName: string;
  data?: unknown;
  error?: string;
  duration: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  toolCall?: ToolCall;
  toolResult?: ToolResult;
  createdAt: number;
  updatedAt: number;
}

export type AgentEventType =
  | 'llm_start'
  | 'llm_response'
  | 'tool_start'
  | 'tool_success'
  | 'tool_error'
  | 'agent_finish';

export interface AgentEventBase<T extends AgentEventType> {
  type: T;
  timestamp: number;
}

export interface LlmStartEvent extends AgentEventBase<'llm_start'> {
  conversationId: string;
  messageId: string;
  input: string;
}

export interface LlmResponseEvent extends AgentEventBase<'llm_response'> {
  conversationId: string;
  messageId: string;
  response: {
    content: string;
    toolCall?: ToolCall;
    done: boolean;
  };
}

export interface ToolStartEvent extends AgentEventBase<'tool_start'> {
  conversationId: string;
  messageId: string;
  toolName: string;
  args: Record<string, unknown>;
}

export interface ToolSuccessEvent extends AgentEventBase<'tool_success'> {
  conversationId: string;
  messageId: string;
  toolName: string;
  result: ToolResult;
}

export interface ToolErrorEvent extends AgentEventBase<'tool_error'> {
  conversationId: string;
  messageId: string;
  toolName: string;
  error: {
    type: 'not_found' | 'timeout' | 'argument' | 'execution';
    message: string;
  };
}

export interface AgentFinishEvent extends AgentEventBase<'agent_finish'> {
  conversationId: string;
  taskId: string;
  totalSteps: number;
  duration: number;
  success: boolean;
}

export type AgentEvent =
  | LlmStartEvent
  | LlmResponseEvent
  | ToolStartEvent
  | ToolSuccessEvent
  | ToolErrorEvent
  | AgentFinishEvent;

export interface TraceStep {
  stepId: string;
  stepNumber: number;
  type: 'llm' | 'tool';
  status: 'pending' | 'running' | 'success' | 'error';
  llmInput?: string;
  llmResponse?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: ToolResult;
  error?: string;
  duration: number;
}

export interface AgentTrace {
  taskId: string;
  conversationId: string;
  steps: TraceStep[];
  totalDuration: number;
  success: boolean;
  error?: string;
}

export type ToolArgs = Record<string, unknown>;

export interface FieldSchema {
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description?: string;
}

export type ArgsSchema = Record<string, FieldSchema>;

export interface Tool {
  name: string;
  description: string;
  argsSchema?: ArgsSchema;
  execute: (args: ToolArgs) => Promise<ToolResult>;
}

export interface LLMMessage {
  content: string;
  tool_call?: {
    name: string;
    args: ToolArgs;
  };
  done?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}