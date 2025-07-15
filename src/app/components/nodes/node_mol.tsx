'use client';
import { Handle, Node, NodeProps, Position, useConnection, useNodeConnections } from "@xyflow/react"
import { memo } from "react";

type MolecularProps = {
    nome: string
}

export type NodeMolType = Node<MolecularProps>

function NodeMolecular({ data, id }: NodeProps<NodeMolType>) {
    const connection = useConnection();

    const isTarget = connection.inProgress && connection.fromNode.id !== id;

    const label = isTarget ? 'Drop here' : 'Drag to connect'

    return (
        <div className="flex justify-center items-center text-center bg-white rounded-full size-20 text-black text-2xl font-semibold customNode">
            <div className="relative w-1/2 h-1/2 flex justify-center items-center">
                {data.nome}
                {!connection.inProgress && (
                    <Handle
                        className="customHandle"
                        position={Position.Right}
                        type="source"
                    />
                )}
                {(!connection.inProgress || isTarget) && (
                    <Handle className="customHandle" position={Position.Left} type="target" isConnectableStart={false} />
                )}
            </div>
        </div>
    )
}

export default memo(NodeMolecular);