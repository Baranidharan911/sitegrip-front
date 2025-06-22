'use client';

import React, { useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

interface SitemapNode {
  url: string;
  children: SitemapNode[];
}

interface Props {
  tree: SitemapNode;
}

const nodeWidth = 200;
const nodeHeight = 60;

const layoutTreeWithDagre = (tree: SitemapNode) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB' });

  let nodeList: Node[] = [];
  let edgeList: Edge[] = [];

  const traverse = (node: SitemapNode, parentId?: string, index = 0) => {
    const nodeId = node.url;
    dagreGraph.setNode(nodeId, { width: nodeWidth, height: nodeHeight });

    if (parentId) {
      dagreGraph.setEdge(parentId, nodeId);
      edgeList.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        animated: true,
        style: { stroke: '#6366f1' },
      });
    }

    nodeList.push({
      id: nodeId,
      data: { label: node.url.replace(/^https?:\/\//, '') },
      position: { x: 0, y: 0 }, // will be updated later
      style: {
        padding: 10,
        borderRadius: 12,
        border: '1px solid #c7d2fe',
        backgroundColor: 'white',
        fontSize: 12,
      },
    });

    node.children?.forEach((child) => traverse(child, nodeId));
  };

  traverse(tree);

  dagre.layout(dagreGraph);

  nodeList = nodeList.map((node) => {
    const pos = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - nodeWidth / 2,
        y: pos.y - nodeHeight / 2,
      },
    };
  });

  return { nodeList, edgeList };
};

const GraphSitemap: React.FC<Props> = ({ tree }) => {
  const [{ nodeList, edgeList }] = useState(() => layoutTreeWithDagre(tree));

  const [nodes, , onNodesChange] = useNodesState(nodeList);
  const [edges, , onEdgesChange] = useEdgesState(edgeList);

  return (
    <div className="h-[80vh] border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background gap={20} size={1} />
      </ReactFlow>
    </div>
  );
};

export default GraphSitemap;
