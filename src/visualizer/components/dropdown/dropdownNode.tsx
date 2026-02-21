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
import { useState, useEffect } from "react";
import {
    DEFAULT_DROPDOWN_COLOR,
    WARNING_COLOR
} from "../../resources/constants";
import type { DropdownNodeProps } from "../../resources/tree-interfaces";
import * as styles from "../../styles/dropdown-tree.styles";

function DropdownNode(props: DropdownNodeProps) {
    const { treeNode, treeLevel, detailedNode, onClick, onCollapseTree, onFindNode } = props;

    const [ifCollapsible, setIfCollapsible] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [hoverStatus, setHoverStatus] = useState(false);

    useEffect(() => {
        if (treeNode.children && treeNode.children.length) {
            setIfCollapsible(true);
        }

        setShowDetails(detailedNode === treeNode.nodeID ? true : false);
        setIsCollapsed(treeNode.didCollapse);
    }, [treeNode, detailedNode]);

    function updateHoverStatus(state: boolean) {
        setHoverStatus(state);
    }

    function onClickNode() {
        onClick(treeNode);
        setShowDetails(true);
    }

    const nodeColor = treeNode.errorNode ? WARNING_COLOR : DEFAULT_DROPDOWN_COLOR;
    const arrowStyle: React.CSSProperties = {
        cursor: ifCollapsible ? "pointer" : "default",
        fontSize: 14,
        color: nodeColor === "red" ? "#DB3247" : "#333",
        userSelect: "none",
        lineHeight: "40px"
    };

    return (
        <div>
            <div
                onMouseOver={() => { treeNode.position ? updateHoverStatus(true) : {}; }}
                onMouseLeave={() => updateHoverStatus(false)}
                style={{
                    ...styles.dropdownNodeStyle,
                    backgroundColor: showDetails ? "#f5f5f0" : "white",
                    fontStyle: showDetails ? "italic" : "normal",
                    marginLeft: treeLevel * 35
                }}
            >
                <div style={styles.dropdownArrowStyle}>
                    {!ifCollapsible && (
                        <span style={arrowStyle}>•</span>
                    )}

                    {ifCollapsible && isCollapsed && (
                        <span
                            style={arrowStyle}
                            onClick={() => onCollapseTree(treeNode.nodeID, false)}
                        >
                            ▼
                        </span>
                    )}

                    {ifCollapsible && !isCollapsed && (
                        <span
                            style={arrowStyle}
                            onClick={() => onCollapseTree(treeNode.nodeID, false)}
                        >
                            ▶
                        </span>
                    )}
                </div>

                <div
                    style={{
                        ...styles.nodeLabelStyle,
                        color: treeNode.errorNode ? "#DB3247" : DEFAULT_DROPDOWN_COLOR,
                        fontWeight: treeNode.isNodePath ? "bold" : "normal"
                    }}
                    onClick={onClickNode}
                >
                    {treeNode.value.length > 25 ? treeNode.kind : treeNode.value}

                    {ifCollapsible && !treeNode.didCollapse && treeNode.diagnostics
                        && treeNode.diagnostics.length > 0 && (
                            <div style={styles.iconStyle}>
                                <span style={{ color: "#DB3247", fontSize: 14 }}>⚠</span>
                            </div>
                        )}
                </div>

                <div
                    style={{
                        ...styles.iconStyle,
                        cursor: "pointer",
                        marginRight: 4
                    }}
                >
                    {hoverStatus && treeNode.position && (
                        <span
                            style={{
                                fontSize: 14,
                                cursor: "pointer",
                                background: "#20b6b0",
                                color: "#fff",
                                borderRadius: "50%",
                                padding: "2px 5px",
                                lineHeight: "20px"
                            }}
                            onClick={() => { onFindNode(treeNode.position); }}
                        >
                            ⌖
                        </span>
                    )}
                </div>
            </div>

            {ifCollapsible && isCollapsed && (
                treeNode.children.map((item, id) => (
                    <DropdownNode
                        key={id}
                        treeNode={item}
                        treeLevel={treeLevel + 1}
                        detailedNode={detailedNode}
                        onClick={onClick}
                        onCollapseTree={onCollapseTree}
                        onFindNode={onFindNode}
                    />
                ))
            )}
        </div>
    );
}

export default DropdownNode;
