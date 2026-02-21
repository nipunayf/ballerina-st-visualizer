"use strict";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { TreeEdgeProps } from "../../resources/tree-interfaces";
import { treeEdgeStyles } from "../../styles/graphical-tree.styles";

function TreeNodeEdge(props: TreeEdgeProps) {
    const { edge, isLocateAction } = props;

    const [isLocateMode, setIsLocateMode] = useState(false);
    const [isNodePath, setIsNodePath] = useState(false);
    const edgeCoords = edge.sections;

    useEffect(() => {
        setIsLocateMode(isLocateAction);
        if (isLocateAction) {
            setIsNodePath(edge.isNodePath);
        }
    }, [props]);

    if (!edgeCoords || edgeCoords.length === 0 || !edgeCoords[0] || !edgeCoords[0].startPoint || !edgeCoords[0].endPoint) {
        return null;
    }

    return (
        <motion.line
            initial={{
                opacity: 0,
                x1: edgeCoords[0].startPoint.x,
                y1: edgeCoords[0].startPoint.y,
                x2: edgeCoords[0].startPoint.x,
                y2: edgeCoords[0].startPoint.y,
            }}
            animate={{
                x1: edgeCoords[0].startPoint.x,
                y1: edgeCoords[0].startPoint.y,
                x2: edgeCoords[0].endPoint.x,
                y2: edgeCoords[0].endPoint.y,
                opacity: isLocateMode ? (isNodePath ? 1 : 0.3) : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            markerEnd="url(#arrowhead)"
            style={{
                ...treeEdgeStyles,
                strokeWidth: isLocateMode ? (isNodePath ? 1.1 : 1) : 1
            }}
        />
    );
}

export default TreeNodeEdge;
