import { create } from 'zustand';
import type {
  AgentEvent,
  AgentStateSnapshot,
  CitationRecord,
  MemoryRecord,
  Message,
  Plan,
  ToolCallRecord,
  WorkflowEvent,
} from '../types/agent';

interface AgentState {
  messages: Message[];
  events: AgentEvent[];
  plan: Plan | null;
  tools: ToolCallRecord[];
  citations: CitationRecord[];
  memory: MemoryRecord[];
  status: 'idle' | 'running' | 'success' | 'error';
  state?: AgentStateSnapshot;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, patch: Partial<Message>) => void;
  addEvent: (event: AgentEvent) => void;
  updatePlan: (plan: Plan) => void;
  reset: () => void;

  workflow: WorkflowEvent[];
  memories: MemoryRecord[];
  isStreaming: boolean;
  setStreaming: (value: boolean) => void;
  upsertTool: (tool: ToolCallRecord) => void;
  setCitations: (citations: CitationRecord[]) => void;
  setMemory: (memory: MemoryRecord[]) => void;
  setState: (state: AgentStateSnapshot) => void;
  setStatus: (status: AgentState['status']) => void;
}

const welcomeMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Agent Console 已就绪。默认任务是：**分析华东区域销售下降原因，并生成报告**。点击发送任务即可观察完整 Agent 执行链路。',
  createdAt: Date.now(),
};

export const useAgentStore = create<AgentState>((set) => ({
  messages: [welcomeMessage],
  events: [],
  plan: null,
  tools: [],
  citations: [],
  memory: [],
  workflow: [],
  memories: [],
  status: 'idle',
  isStreaming: false,

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, ...patch } : message,
      ),
    })),
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
      workflow: [...state.workflow, toWorkflowEvent(event)],
    })),
  updatePlan: (plan) => set({ plan }),
  reset: () =>
    set({
      events: [],
      workflow: [],
      tools: [],
      citations: [],
      memory: [],
      memories: [],
      plan: null,
      state: undefined,
      status: 'idle',
      isStreaming: false,
    }),

  setStreaming: (value) => set({ isStreaming: value, status: value ? 'running' : 'idle' }),
  upsertTool: (tool) =>
    set((state) => {
      const exists = state.tools.some((item) => item.id === tool.id);
      return {
        tools: exists
          ? state.tools.map((item) => (item.id === tool.id ? tool : item))
          : [...state.tools, tool],
      };
    }),
  setCitations: (citations) => set({ citations }),
  setMemory: (memory) => set({ memory, memories: memory }),
  setState: (agentState) => set({ state: agentState }),
  setStatus: (status) => set({ status, isStreaming: status === 'running' }),
}));

function toWorkflowEvent(event: AgentEvent): WorkflowEvent {
  const payload = event.payload as
    { title?: string; detail?: string; status?: WorkflowEvent['status'] } | undefined;
  return {
    id: event.id,
    type: event.type,
    title: payload?.title ?? event.type,
    detail: payload?.detail,
    timestamp: event.timestamp,
    status: payload?.status ?? 'running',
  };
}
