"use strict";
/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
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
