import { MISSING } from "../resources/constants";
import type { TreeNode } from "../resources/tree-interfaces";
import { assignProperties } from "./syntax-tree-mapper-utils";

let nodeCount: number = -1;

export function mapSyntaxTree(
    nodeObj: any,
    parentObj: TreeNode | any,
    treeLevel: number,
    foundNodeBlock: boolean,
    syntaxTreeObj: TreeNode[],
    checkNodePath: boolean
) {
    if (!nodeObj) {
        return;
    }

    // Determine if it's a token (leaf) or parent node
    // In WASM parser format, tokens have no children or empty children array
    const isToken = !nodeObj.children || nodeObj.children.length === 0;
    
    // Mapping properties
    const kind = nodeObj.kind;
    // For tokens, value might be present (e.g. identifier name, literal value)
    // If not, fall back to kind (e.g. keywords)
    const value = nodeObj.value !== undefined ? nodeObj.value : kind;
    const isMissing = nodeObj.isMissing;

    // Check if this node is part of the path we are looking for (if locate mode is active)
    const isNodePath = nodeObj.isNodePath || foundNodeBlock;
    const isLocatedNode = nodeObj.isLocatedNode; 

    // Create the tree node structure
    const treeNode: TreeNode = {
        nodeID: isToken ? `c${++nodeCount}` : `p${++nodeCount}`,
        value: value,
        kind: isMissing ? MISSING + kind : kind,
        parentID: parentObj.nodeID,
        children: [],
        // Previously determined that 'true' means EXPANDED in the graph mapper logic.
        // We want levels 0 and 1 to be expanded by default.
        didCollapse: checkNodePath ? 
            (isNodePath ? !isLocatedNode : false) : 
            (treeLevel < 2 ? true : false),
        ifParent: !isToken,
        isNodePath: isNodePath,
        leadingMinutiae: mapMinutiae(nodeObj.leadingMinutiae),
        trailingMinutiae: mapMinutiae(nodeObj.trailingMinutiae),
        diagnostics: nodeObj.diagnostics || [],
        errorNode: isMissing || (nodeObj.diagnostics && nodeObj.diagnostics.length > 0),
        position: nodeObj.position || { startLine: 0, endLine: 0, startColumn: 0, endColumn: 0 }
    };

    // Add to parent or root array
    if (parentObj && parentObj.children) {
        parentObj.children.push(treeNode);
    } else {
        syntaxTreeObj.push(treeNode);
    }

    // Recurse for children
    if (!isToken && nodeObj.children) {
        let currentBlockStatus = isNodePath;
        if (checkNodePath && isNodePath && isLocatedNode) {
            currentBlockStatus = true;
        }

        nodeObj.children.forEach((child: any) => {
            mapSyntaxTree(child, treeNode, treeLevel + 1, currentBlockStatus, syntaxTreeObj, checkNodePath);
        });

        // Compute position/properties from children if necessary
        if (treeNode.children.length > 0) {
            assignProperties(treeNode);
        }
    }
}

function mapMinutiae(minutiaeList: any[]): any[] {
    if (!minutiaeList) return [];
    return minutiaeList.map(m => ({
        kind: m.kind,
        minutiae: m.value, // WASM output uses 'value' for content
        isInvalid: m.isInvalid || false
    }));
}

export function resetNodeCount() {
    nodeCount = -1;
}
