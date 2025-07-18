'use client';
import { ConnectionLineComponentProps, getStraightPath } from '@xyflow/react';

function CustomConnectionLine({ fromX, fromY, toX, toY, connectionLineStyle }: ConnectionLineComponentProps) {
    const [edgePath] = getStraightPath({
        sourceX: fromX,
        sourceY: fromY,
        targetX: toX,
        targetY: toY,
    });

    return (
        <g>
            <path style={connectionLineStyle} fill="none" d={edgePath} />
        </g>
    );
}

export default CustomConnectionLine