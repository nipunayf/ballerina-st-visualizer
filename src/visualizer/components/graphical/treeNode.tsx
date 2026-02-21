"use strict";
import { motion } from "framer-motion";
import { useState } from "react";
import { TOKEN_COLOR } from "../../resources/constants";
import type { GraphicalNodeProps } from "../../resources/tree-interfaces";
import * as styles from "../../styles/graphical-tree.styles";
import Diagnostics from "./diagnosticsPopup";
import NodeDetails from "./nodeDetailsPopup";

function TreeNode(props: GraphicalNodeProps) {
    const { node, isLocateAction, onCollapseTree, onFindNode } = props;

    const [didHoverNode, setHoverNodeState] = useState(false);
    const [didHoverWarning, setHoverWarningState] = useState(false);

    function updateHoverNodeState(status: boolean) {
        setHoverNodeState(status);
    }

    function updateHoverWarningState(status: boolean) {
        setHoverWarningState(status);
    }

    function onClickNode() {
        if (node.ifParent) {
            updateHoverNodeState(false);
            onCollapseTree();
        }
    }

    const locateBtnColor = node.nodeColor === TOKEN_COLOR ? "#20b6b0" : "#9e9e9e";

    return (
        <div>
            <motion.div
                id={`node-${node.id}`}
                initial={{
                    opacity: 0,
                    scale: 0.8,
                    left: props.parentX ?? node.x,
                    top: props.parentY ?? node.y
                }}
                animate={{
                    height: node.height,
                    left: node.x,
                    opacity: isLocateAction ? (node.isNodePath ? 1 : 0.55) : 1,
                    top: node.y,
                    width: node.width,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                    ...styles.nodeContainerStyle,
                    backgroundColor: node.nodeColor,
                    boxShadow: node.isCollapsible ? "0 4px 12px rgba(0, 0, 0, 0.4)" : "none",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                }}
            >
                <div
                    style={styles.labelContainerStyle}
                    onMouseLeave={() => updateHoverNodeState(false)}
                    onMouseOver={() => updateHoverNodeState(true)}
                >
                    {didHoverNode && node.position && (
                        <div
                            style={{
                                ...styles.iconStyle,
                                cursor: "pointer"
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onFindNode();
                            }}
                        >
                            <span style={{
                                fontSize: 14,
                                color: "#fff",
                                background: locateBtnColor,
                                borderRadius: "50%",
                                padding: "1px 4px",
                                lineHeight: "18px",
                                display: "inline-block"
                            }}>
                                ⌖
                            </span>
                        </div>
                    )}
                    <div onClick={onClickNode}>
                        {node.label}
                    </div>
                </div>

                {node.hasDiagnostics && node.diagnostics.length && (
                    <div
                        style={styles.iconStyle}
                        onMouseLeave={() => updateHoverWarningState(false)}
                        onMouseOver={() => updateHoverWarningState(true)}
                    >
                        <span style={{ fontSize: 18, color: "#DB3247" }}>⚠</span>
                    </div>
                )}
            </motion.div>

            {didHoverNode && <NodeDetails node={node} />}
            {didHoverWarning && <Diagnostics node={node} />}
        </div>
    );
}

export default TreeNode;
