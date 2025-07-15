'use client';
import { getEdgeParams } from '@/app/utils/flow';
import { BaseEdge, Edge, getStraightPath, useInternalNode } from '@xyflow/react';

function FloatingEdge({ id, source, target, style, markerEnd }: Edge) {
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

    const [path] = getStraightPath({
        sourceX: sx,
        sourceY: sy,
        targetX: tx,
        targetY: ty,
    });

    return (
        <BaseEdge
            id={id}
            className="react-flow__edge-path"
            path={path}
            markerEnd={markerEnd as string}
            style={style}
        />
    );
}

export default FloatingEdge;