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
