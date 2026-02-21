"use strict";
import { useState, useEffect } from "react";
import DropdownNode from "../components/dropdown/dropdownNode";
import DropdownNodeDetails from "../components/dropdown/dropdownNodeDetails";
import type { DropdownTreeProps, TreeNodeObject } from "../resources/tree-interfaces";
import * as styles from "../styles/dropdown-tree.styles";

function DropdownTree(props: DropdownTreeProps) {
    const { treeNode, onCollapseTree, onFindNode } = props;
    const [detailedNode, setDetailedNode] = useState<TreeNodeObject | undefined>(undefined);

    useEffect(() => {
        setDetailedNode(treeNode);
    }, [treeNode.nodeID]);

    function updateDetailedNode(nodeProp: TreeNodeObject) {
        setDetailedNode(nodeProp);
    }

    return (
        <div style={styles.containerStyle}>
            <div
                style={{
                    ...styles.sideDividerStyle,
                    marginRight: 30,
                    paddingRight: 20
                }}
            >
                <DropdownNode
                    treeNode={treeNode}
                    treeLevel={0}
                    detailedNode={detailedNode ? detailedNode.nodeID : treeNode.nodeID}
                    onClick={updateDetailedNode}
                    onCollapseTree={onCollapseTree}
                    onFindNode={onFindNode}
                />
            </div>

            <div
                style={{
                    ...styles.sideDividerStyle,
                    maxWidth: 450,
                    minWidth: 400
                }}
            >
                {detailedNode && (
                    <DropdownNodeDetails treeNode={detailedNode} />
                )}
            </div>
        </div>
    );
}

export default DropdownTree;
