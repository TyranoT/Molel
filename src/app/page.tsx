'use client';
import { addEdge, Background, Connection, ConnectionMode, Edge, MarkerType, Panel, ReactFlow, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import NodeMolecular, { NodeMolType } from "./components/nodes/node_mol";
import { nanoid } from "nanoid";
import Molecules from 'molecules.js';
import CustomConnectionLine from "./components/custom/line";
import FloatingEdge from "./components/custom/edge";
import { useEffect, useState } from "react";
import { getFixo, ListAlcanosInfixo, ListAlcanosPreFixo } from "./utils/listNomeclatura";

const nodeType = {
  nodeMolecular: NodeMolecular
}

export default function Home() {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeMolType>([]);
  const [edges, , onEdgesChange] = useEdgesState<Edge>([]);
  const { getNodes, setEdges } = useReactFlow();
  const [formula, setFormula] = useState('');
  const [resultOrg, setResultOrg] = useState();

  const plusNodes = (molecula: string) => {
    const lastNode = getNodes()[getNodes.length - 1];

    const newNode: NodeMolType = {
      id: `${nanoid(3)}`,
      type: "nodeMolecular",
      data: {
        nome: molecula
      },
      position: {
        x: lastNode ? ((lastNode.position.x) + (lastNode.measured?.width ?? 0)) + 50 : 0,
        y: lastNode ? ((lastNode.position.y)) : 0
      },
    }

    setNodes(nds => [...nds, newNode]);
  }

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

  const connectNome = () => {
    // 1. Contagem de átomos
    const atomCounts: Record<string, number> = {};
    nodes.forEach(n => {
      const el = n.data.nome;
      atomCounts[el] = (atomCounts[el] || 0) + 1;
    });

    // 2. Contagem de ligações C–C
    let conexoesCC = 0;
    edges.forEach(e => {
      const a = nodes.find(n => n.id === e.source)?.data.nome;
      const b = nodes.find(n => n.id === e.target)?.data.nome;
      if (a === 'C' && b === 'C') conexoesCC++;
    });

    // 3. Montar fórmula
    const mol = Object.entries(atomCounts)
      .sort((a, b) => a[0] === 'C' ? -1 : b[0] === 'C' ? 1 : 0)
      .map(([el, n]) => el + (n > 1 ? n : ''))
      .join('');
    setFormula(mol);

    // 4. Parse com molecules.js
    const m = new Molecules();
    const parsed: { C?: number, H?: number } = m.getMolecules(mol);

    // 5. Log dos resultados
    console.log(parsed);             // ex: { C: 2, H: 1 }
    console.log('Ligações C–C:', conexoesCC);

    const ligacoesCCMap = new Map<string, number>();

    edges.forEach(e => {
      const sourceNode = nodes.find(n => n.id === e.source);
      const targetNode = nodes.find(n => n.id === e.target);
      const nomeA = sourceNode?.data.nome;
      const nomeB = targetNode?.data.nome;

      if (nomeA === 'C' && nomeB === 'C') {
        const idsOrdenados = [e.source, e.target].sort();
        const key = idsOrdenados.join('-');
        ligacoesCCMap.set(key, (ligacoesCCMap.get(key) || 0) + 1);
      }
    });

    // Contar quantas são simples, duplas, triplas
    let simples = 0, duplas = 0, triplas = 0;
    for (const count of ligacoesCCMap.values()) {
      if (count === 1) simples++;
      else if (count === 2) duplas++;
      else if (count >= 3) triplas++;
    }

    console.log('C–C simples:', simples);
    console.log('C–C duplas:', duplas);
    console.log('C–C triplas ou mais:', triplas);

    const findPreFixo = ListAlcanosPreFixo.find(e => e.n == parsed.C)?.fixo;
    const findInFixo = getFixo(simples, duplas, triplas);

    const result = findPreFixo?.concat(findInFixo??'', 'O');
    console.log(result)
    setResultOrg(result)
  }

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
          connectNome();
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
                plusNodes('C')
              }}
              className="size-10 flex justify-center shadow cursor-grab hover:-translate-y-2 transition-transform duration-150 ease-in-out items-center font-semibold rounded-full text-center text-white bg-black"
            >
              C
            </div>
            <div
              onClick={() => {
                plusNodes('O')
              }}
              className="size-10 flex justify-center shadow cursor-grab hover:-translate-y-2 transition-transform duration-150 ease-in-out items-center font-semibold rounded-full text-center text-white bg-black"
            >
              O
            </div>
            <div
              onClick={() => {
                plusNodes('H')
              }}
              className="size-10 flex justify-center shadow cursor-grab hover:-translate-y-2 transition-transform duration-150 ease-in-out items-center font-semibold rounded-full text-center text-white bg-black"
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
