import { motion } from 'framer-motion';
import type { PointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, CenterIcon, FitViewIcon, Panel, ZoomInIcon, ZoomOutIcon } from '../ui';
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

const nodeWidth = 300;
const nodeHeight = 116;

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

  function centerCurrentStep() {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    window.setTimeout(() => {
      activeRef.current?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
    }, 40);
  }

  function fitView() {
    setScale(0.88);
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
      description={activeNode ? `Current object: ${activeNode.component}` : 'Runtime dependency path.'}
      actions={
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="ghost" aria-label="Zoom out" onClick={() => setScale((value) => Math.max(0.72, value - 0.12))}>
            <ZoomOutIcon className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-mono text-xs text-muted">
            {Math.round(scale * 100)}%
          </span>
          <Button size="sm" variant="ghost" aria-label="Zoom in" onClick={() => setScale((value) => Math.min(1.35, value + 0.12))}>
            <ZoomInIcon className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={fitView}>
            <FitViewIcon className="h-4 w-4" />
            Fit
          </Button>
          <Button size="sm" variant="secondary" onClick={centerCurrentStep}>
            <CenterIcon className="h-4 w-4" />
            Center
          </Button>
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
                  strokeWidth={next.node.status === 'running' ? 3 : 2}
                  strokeLinecap="round"
                  strokeDasharray={next.node.status === 'waiting' ? '6 8' : undefined}
                  initial={{ pathLength: 0, opacity: 0.35 }}
                  animate={{ pathLength: 1, opacity: 0.92 }}
                  transition={{ duration: 0.22 }}
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
  const lanes = [96, 452];
  const points = nodes.map((node, index) => {
    const laneIndex = index % 2;
    return {
      node,
      x: lanes[laneIndex],
      y: 56 + index * 136,
    };
  });

  return {
    points,
    width: 860,
    height: Math.max(440, 132 + nodes.length * 136),
  };
}

function getConnectorPath(from: GraphPoint, to: GraphPoint): string {
  const startX = from.x + nodeWidth / 2;
  const startY = from.y + nodeHeight;
  const endX = to.x + nodeWidth / 2;
  const endY = to.y;
  const middleY = startY + Math.max(34, (endY - startY) / 2);
  return `M ${startX} ${startY} C ${startX} ${middleY}, ${endX} ${middleY}, ${endX} ${endY}`;
}
