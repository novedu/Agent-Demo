import type { AgentServerEvent } from '@shared-types/api';

export const sseHeaders = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
} as const;

export interface EventStreamWriter {
  write: (chunk: string) => void;
  close?: () => void;
}

export interface EventStreamSubscription {
  send: (event: AgentServerEvent) => void;
  heartbeat: () => void;
  close: () => void;
}

export function serializeSseEvent(event: AgentServerEvent): string {
  return [
    `id: ${event.id}`,
    `event: ${event.type}`,
    `data: ${JSON.stringify(event)}`,
    '',
    '',
  ].join('\n');
}

export function serializeSseHeartbeat(): string {
  return `: heartbeat ${Date.now()}\n\n`;
}

export function createEventStream(writer: EventStreamWriter): EventStreamSubscription {
  return {
    send: (event) => writer.write(serializeSseEvent(event)),
    heartbeat: () => writer.write(serializeSseHeartbeat()),
    close: () => writer.close?.(),
  };
}
