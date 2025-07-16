import { nanoid } from "nanoid";
import { NodeMolType } from "../components/nodes/node_mol";
import { Dispatch, SetStateAction } from "react";

type Props = {
    molecula: string;
    nodes: NodeMolType[],
    setNodes: Dispatch<SetStateAction<NodeMolType[]>>
}

export const plusNodes = ({ molecula, nodes, setNodes }: Props) => {
    const lastNode = nodes[nodes.length - 1];

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