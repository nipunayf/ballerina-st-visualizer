"use strict";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import TreeNodeEdge from "../components/graphical/treeEdge";
import TreeNode from "../components/graphical/treeNode";
import type { GraphicalTreeProps } from "../resources/tree-interfaces";

function GraphicalTree(props: GraphicalTreeProps) {
    const { treeGraph, onFindNode, onCollapseTree } = props;
    const [isLocateAction, setIsLocateAction] = useState(false);

    useEffect(() => {
        if (treeGraph) {
            setIsLocateAction(treeGraph.isLocateMode);
        }
    }, [treeGraph]);

    return (
        <div>
            {treeGraph && (
                <motion.div
                    animate={{ width: treeGraph.width, height: treeGraph.height }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{ position: "relative", margin: "0 auto" }}
                >
                    {treeGraph.children.map((item) => {
                        const parentNode = treeGraph.children.find(n => n.id === item.parentID);
                        return (
                            <TreeNode
                                key={item.id}
                                node={item}
                                isLocateAction={isLocateAction}
                                onFindNode={() => onFindNode(item.position)}
                                onCollapseTree={() => onCollapseTree(item.id, true)}
                                parentX={parentNode?.x}
                                parentY={parentNode?.y}
                            />
                        );
                    })}

                    <motion.svg
                        animate={{ width: treeGraph.width, height: treeGraph.height }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <defs>
                            <marker
                                id="arrowhead"
                                markerWidth="10"
                                markerHeight="7"
                                refX="9"
                                refY="3.5"
                                orient="auto"
                            >
                                <polygon points="0 0, 10 3.5, 0 7" fill="#6e7681" />
                            </marker>
                        </defs>
                        {treeGraph.edges.map((item) => (
                            <TreeNodeEdge
                                key={item.id}
                                edge={item}
                                isLocateAction={isLocateAction}
                            />
                        ))}
                    </motion.svg>
                </motion.div>
            )}
        </div>
    );
}

export default GraphicalTree;
