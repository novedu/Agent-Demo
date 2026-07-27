import type { AgentEvent, AgentEventType } from './types';

export class EventEmitter {
  private listeners = new Map<AgentEventType, Array<(event: AgentEvent) => void>>();

  on<T extends AgentEventType>(type: T, listener: (event: AgentEvent) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  off<T extends AgentEventType>(type: T, listener: (event: AgentEvent) => void): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      this.listeners.set(type, listeners.filter(l => l !== listener));
    }
  }

  emit<T extends AgentEventType>(event: AgentEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (err) {
          console.error('Listener error:', err);
        }
      });
    }
  }

  once<T extends AgentEventType>(type: T, listener: (event: AgentEvent) => void): void {
    const onceListener = (event: AgentEvent) => {
      listener(event);
      this.off(type, onceListener);
    };
    this.on(type, onceListener);
  }
}