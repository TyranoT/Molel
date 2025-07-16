'use client';
import { Background, ConnectionMode, Edge, MarkerType, OnNodeDrag, Panel, ReactFlow, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import NodeMolecular, { NodeMolType } from "./components/nodes/node_mol";
import { nanoid } from "nanoid";
import CustomConnectionLine from "./components/custom/line";
import FloatingEdge from "./components/custom/edge";
import { useCallback, useEffect, useState } from "react";
import { plusNodes } from "./functions/plusNodes";
import { parseFormula } from "./functions/parseFormula";
import { connectNome } from "./functions/connectNome";
import { buildFormula } from "./functions/buildFormula";

const nodeType = {
  nodeMolecular: NodeMolecular
}

export default function Home() {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeMolType>([]);
  const [edges, , onEdgesChange] = useEdgesState<Edge>([]);
  const { getIntersectingNodes, setEdges } = useReactFlow();
  const [formula, setFormula] = useState('');
  const [resultOrg, setResultOrg] = useState<string>('');

  const defaultEdgeOptions = {
    type: 'floating',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#b1b1b7',
    },
  };

  const edgeTypes = {
    floating: FloatingEdge,
  };

  const connectionLineStyle = {
    stroke: '#b1b1b7',
  };

  const onNodeDrag: OnNodeDrag<NodeMolType> = useCallback((event, draggedNode) => {
    const [intersected] = getIntersectingNodes(draggedNode);

    if (!intersected) return;

    const nomeA = draggedNode.data.nome;
    const nomeB = intersected.data.nome;

    const parsedA = parseFormula(nomeA);
    const parsedB = parseFormula(nomeB as string);

    for (const el in parsedB) {
      parsedA[el] = (parsedA[el] || 0) + parsedB[el];
    }

    const newNome = buildFormula(parsedA);

    setNodes((prevNodes) => {
      const filtered = prevNodes.filter(
        (n) => n.id !== draggedNode.id && n.id !== intersected.id
      );

      const newNode: NodeMolType = {
        id: nanoid(3),
        position: {
          x: (draggedNode.position.x + intersected.position.x) / 2,
          y: (draggedNode.position.y + intersected.position.y) / 2,
        },
        data: { nome: newNome },
        type: 'nodeMolecular',
      };

      return [...filtered, newNode];
    });
  }, []);

  useEffect(() => {
    connectNome({
      edges,
      nodes,
      setFormula,
      setResultOrg
    });
  }, [nodes, edges]);

  return (
    <main className="flex flex-col gap-2 h-screen w-full">
      <ReactFlow
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDrag}
        onConnect={({ source, sourceHandle, target, targetHandle }) => {
          setEdges(eds => {
            const listenerCount = eds.filter(e => e.source === source && e.target === target).length;
            const offset = (listenerCount === 0 ? (0) : listenerCount === 1 ? (-10) : (10));
            const newEdge = {
              id: `e-${Date.now().toLocaleString()}`,
              source,
              sourceHandle,
              target,
              targetHandle,
              style: { transform: `translateY(${offset}px)` },
            };
            return [...eds, newEdge];
          });
          connectNome({
            edges,
            nodes,
            setFormula,
            setResultOrg
          });
        }}
        onEdgesDelete={() => {
          connectNome({
            edges,
            nodes,
            setFormula,
            setResultOrg
          });
        }}
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeType}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineComponent={CustomConnectionLine}
        connectionLineStyle={connectionLineStyle}
      >
        <Panel
          position="bottom-center"
          className="bg-white w-[500px] h-[80px] flex justify-start items-center gap-2 px-2 m-0 rounded-t-xl"
        >
          <span className="flex flex-row justify-center w-fit gap-2">
            <div
              onClick={() => {
                plusNodes({ molecula: 'C', nodes: nodes, setNodes: setNodes })
              }}
              className="size-10 flex justify-center select-none shadow cursor-pointer hover:-translate-y-2 transition-transform duration-150 ease-in-out items-center font-semibold rounded-full text-center text-white bg-black"
            >
              C
            </div>
            <div
              onClick={() => {
                plusNodes({ molecula: 'O', nodes: nodes, setNodes: setNodes })
              }}
              className="size-10 flex justify-center select-none shadow cursor-pointer hover:-translate-y-2 transition-transform duration-150 ease-in-out items-center font-semibold rounded-full text-center text-white bg-black"
            >
              O
            </div>
            <div
              onClick={() => {
                plusNodes({ molecula: 'H', nodes: nodes, setNodes: setNodes })
              }}
              className="size-10 flex justify-center select-none shadow cursor-pointer hover:-translate-y-2 transition-transform duration-150 ease-in-out items-center font-semibold rounded-full text-center text-white bg-black"
            >
              H
            </div>
          </span>
          <div className="text-black w-full text-center">Fórmula aproximada: <b>{formula}</b> <b>{resultOrg}</b></div>
        </Panel>
        <Background />
      </ReactFlow>
    </main>
  );
}
