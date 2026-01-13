import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { buildGraphData, buildLocalGraphData, type GraphData, type GraphNode } from './builder';
import { useUIStore } from '@/stores/uiStore';

interface GraphViewProps {
  mode: 'global' | 'local';
  centerFileId?: string;
  depth?: number;
}

type NodeWithPosition = GraphNode & { x?: number; y?: number };

export function GraphView({ mode, centerFileId, depth = 1 }: GraphViewProps) {
  const navigate = useNavigate();
  const { setActiveFileId } = useUIStore();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    async function loadGraph() {
      setLoading(true);
      try {
        const data = mode === 'local' && centerFileId
          ? await buildLocalGraphData(centerFileId, depth)
          : await buildGraphData();
        setGraphData(data);
      } catch (error) {
        console.error('Failed to build graph:', error);
      } finally {
        setLoading(false);
      }
    }

    loadGraph();
  }, [mode, centerFileId, depth]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      graphRef.current.zoomToFit(400, 50);
    }
  }, [graphData]);

  const handleNodeClick = useCallback((node: NodeWithPosition) => {
    setActiveFileId(node.id);
    navigate(`/file/${node.id}`);
  }, [navigate, setActiveFileId]);

  const handleNodeHover = useCallback((node: NodeWithPosition | null) => {
    setHoveredNode(node);
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? 'pointer' : 'default';
    }
  }, []);

  const nodeCanvasObject = useCallback((
    node: NodeWithPosition,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    const nodeSize = Math.sqrt(node.val) * 4;
    const isHovered = hoveredNode?.id === node.id;
    const isCenterNode = mode === 'local' && node.id === centerFileId;
    const x = node.x ?? 0;
    const y = node.y ?? 0;

    ctx.beginPath();
    ctx.arc(x, y, nodeSize, 0, 2 * Math.PI);
    ctx.fillStyle = isHovered || isCenterNode ? '#ffffff' : node.color;
    ctx.fill();

    if (isHovered || isCenterNode) {
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    if (globalScale > 0.5 || isHovered) {
      ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(label, x, y + nodeSize + 2);
    }
  }, [hoveredNode, mode, centerFileId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gkd-accent" />
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gkd-text-muted">
        No files to display in graph
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-gkd-bg relative">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeId="id"
        nodeVal="val"
        nodeColor="color"
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={(node: NodeWithPosition, color, ctx) => {
          const nodeSize = Math.sqrt(node.val) * 4;
          const x = node.x ?? 0;
          const y = node.y ?? 0;
          ctx.beginPath();
          ctx.arc(x, y, nodeSize + 5, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        linkColor={() => 'rgba(255, 255, 255, 0.2)'}
        linkWidth={1}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        backgroundColor="transparent"
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />

      {hoveredNode && (
        <div className="absolute top-4 left-4 bg-gkd-surface border border-gkd-border rounded-lg px-3 py-2 shadow-lg">
          <div className="font-medium text-gkd-text">{hoveredNode.name}</div>
          <div className="text-xs text-gkd-text-muted">
            {hoveredNode.val - 1} backlink{hoveredNode.val - 1 !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => graphRef.current?.zoomToFit(400, 50)}
          className="p-2 bg-gkd-surface border border-gkd-border rounded-lg hover:bg-gkd-border transition-colors"
          title="Fit to view"
        >
          <svg className="w-4 h-4 text-gkd-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
