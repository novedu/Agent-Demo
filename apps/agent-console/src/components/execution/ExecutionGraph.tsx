import { motion } from 'framer-motion';
import type { PointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FitViewIcon, Panel, ZoomInIcon, ZoomOutIcon } from '../ui';
import { ExecutionNode } from './ExecutionNode';
import {
  getStatusColor,
  type ExecutionNodeRecord,
} from './execution-model';

interface ExecutionGraphProps {
  nodes: ExecutionNodeRecord[];
  activeNodeId?: string;
  onSelectNode: (node: ExecutionNodeRecord) => void;
}

interface GraphPoint {
  node: ExecutionNodeRecord;
  x: number;
  y: number;
}

const nodeWidth = 156;
const nodeHeight = 88;
const graphHeight = 120;
const gapX = 184;

export function ExecutionGraph({ nodes, activeNodeId, onSelectNode }: ExecutionGraphProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ pointerX: number; pointerY: number; x: number; y: number }>();

  const graph = useMemo(() => buildGraph(nodes), [nodes]);
  const activeNode = nodes.find((node) => node.id === activeNodeId);

  useEffect(() => {
    if (!activeRef.current) return;
    activeRef.current.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
  }, [activeNodeId]);

  function fitView() {
    setScale(0.85);
    setOffset({ x: 0, y: 0 });
    viewportRef.current?.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: offset.x,
      y: offset.y,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    setOffset({
      x: dragStart.current.x + event.clientX - dragStart.current.pointerX,
      y: dragStart.current.y + event.clientY - dragStart.current.pointerY,
    });
  }

  function handlePointerUp() {
    dragStart.current = undefined;
  }

  return (
    <Panel
      title="Runtime Graph"
      description={activeNode ? `Current object: ${activeNode.component}` : 'Execution & dependency graph'}
      actions={
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setScale((value) => Math.max(0.72, value - 0.12))}
            className="flex h-5 w-5 items-center justify-center rounded border border-line bg-white text-muted hover:bg-panel"
          >
            <ZoomOutIcon className="h-2.5 w-2.5" />
          </button>
          <span className="w-8 text-center font-mono text-[10px] text-muted">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setScale((value) => Math.min(1.35, value + 0.12))}
            className="flex h-5 w-5 items-center justify-center rounded border border-line bg-white text-muted hover:bg-panel"
          >
            <ZoomInIcon className="h-2.5 w-2.5" />
          </button>
          <button
            type="button"
            onClick={fitView}
            className="flex h-5 w-5 items-center justify-center rounded border border-line bg-white text-muted hover:bg-panel"
          >
            <FitViewIcon className="h-2.5 w-2.5" />
          </button>
        </div>
      }
      footer={
        <div className="flex items-center justify-center gap-4 text-[9px] text-muted">
          <LegendItem color="bg-slate-400" label="Pending" />
          <LegendItem color="bg-blue-500" label="Running" />
          <LegendItem color="bg-emerald-500" label="Completed" />
          <LegendItem color="bg-rose-500" label="Failed" />
        </div>
      }
      className="h-full"
      bodyClassName="relative overflow-hidden p-0"
    >
      <div
        ref={viewportRef}
        className="h-full cursor-grab overflow-auto overscroll-contain bg-[radial-gradient(circle_at_1px_1px,#e2e8f0_1px,transparent_0)] bg-[length:24px_24px] active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <motion.div
          className="relative min-h-full min-w-full origin-top-left"
          style={{
            width: graph.width,
            height: graph.height,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
          transition={{ duration: 0.18 }}
        >
          <svg
            className="pointer-events-none absolute inset-0 overflow-visible"
            width={graph.width}
            height={graph.height}
            viewBox={`0 0 ${graph.width} ${graph.height}`}
            aria-hidden="true"
          >
            {graph.points.slice(0, -1).map((point, index) => {
              const next = graph.points[index + 1];
              const stroke = getStatusColor(next.node.status);
              return (
                <motion.path
                  key={`${point.node.id}_${next.node.id}`}
                  d={getConnectorPath(point, next)}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={next.node.status === 'running' ? 2.5 : 1.5}
                  strokeLinecap="round"
                  strokeDasharray={next.node.status === 'waiting' ? '4 6' : undefined}
                  initial={{ pathLength: 0, opacity: 0.3 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 0.25 }}
                />
              );
            })}
            {/* Connection dots */}
            {graph.points.slice(0, -1).map((point, index) => {
              const next = graph.points[index + 1];
              const cx = (point.x + nodeWidth + next.x) / 2;
              const cy = point.y + nodeHeight / 2;
              return (
                <circle
                  key={`dot_${index}`}
                  cx={cx}
                  cy={cy}
                  r={3}
                  fill={getStatusColor(next.node.status)}
                  opacity={0.6}
                />
              );
            })}
          </svg>

          {graph.points.map((point, index) => (
            <motion.div
              key={point.node.id}
              ref={point.node.id === activeNodeId ? activeRef : undefined}
              className="absolute"
              style={{ left: point.x, top: point.y, width: nodeWidth }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: index * 0.025 }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <ExecutionNode
                node={point.node}
                active={point.node.id === activeNodeId}
                onSelect={onSelectNode}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Panel>
  );
}

function buildGraph(nodes: ExecutionNodeRecord[]): { points: GraphPoint[]; width: number; height: number } {
  const lanes = [14];
  const points = nodes.map((node, index) => {
    return {
      node,
      x: 24 + index * gapX,
      y: lanes[0],
    };
  });

  return {
    points,
    width: Math.max(680, 48 + Math.max(1, nodes.length) * gapX),
    height: graphHeight,
  };
}

function getConnectorPath(from: GraphPoint, to: GraphPoint): string {
  const startX = from.x + nodeWidth;
  const startY = from.y + nodeHeight / 2;
  const endX = to.x;
  const endY = to.y + nodeHeight / 2;
  const middleX = startX + Math.max(32, (endX - startX) / 2);
  return `M ${startX} ${startY} C ${middleX} ${startY}, ${middleX} ${endY}, ${endX} ${endY}`;
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}