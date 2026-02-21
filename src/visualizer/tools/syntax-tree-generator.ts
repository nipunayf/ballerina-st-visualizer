import * as _ from "lodash";
import { LAYOUT_OPTIONS, LOCATE_TREE_VIEW } from "../resources/constants";
import type { TreeNode } from "../resources/tree-interfaces";
import { mapSyntaxGraph } from "./syntax-graph-mapper";
import { mapSyntaxTree, resetNodeCount } from "./syntax-tree-mapper";

// Use mutable arrays/objects so that ES module live bindings
// reflect in-place mutations (rather than reassignments).
export const syntaxTreeObj: TreeNode[] = [];
export const nodeMembers: any[] = [];
export const nodeEdges: any[] = [];
export let checkNodePath: boolean = false;

export let graphicalTreeObj: TreeNode[] = [];

export function retrieveGraph(responseTree: any, activatedCommand: string) {
    syntaxTreeObj.splice(0, syntaxTreeObj.length);
    checkNodePath = activatedCommand === LOCATE_TREE_VIEW;
    resetNodeCount();
    mapSyntaxTree(responseTree, {}, 0, false, syntaxTreeObj, checkNodePath);
    graphicalTreeObj = _.cloneDeep(syntaxTreeObj);
    return updateSyntaxTree("", true);
}

export function updateSyntaxTree(nodeID: string, isGraphical: boolean) {
    if (isGraphical) {
        nodeEdges.splice(0, nodeEdges.length);
        nodeMembers.splice(0, nodeMembers.length);
    }
    mapSyntaxGraph(isGraphical ? graphicalTreeObj : syntaxTreeObj, nodeID, isGraphical, nodeMembers, nodeEdges, checkNodePath);

    return setGraph();
}

export function expandToNode(targetNodeID: string) {
    // We need to trace parents. So let's build a map of parent pointers first
    const parentMap = new Map<string, string>();
    
    function buildParentMap(nodes: TreeNode[], parentId?: string) {
        for (const n of nodes) {
            if (parentId) parentMap.set(n.nodeID, parentId);
            if (n.children && n.children.length > 0) {
                buildParentMap(n.children, n.nodeID);
            }
        }
    }
    buildParentMap(graphicalTreeObj);

    // Collect all ancestors
    const ancestors = new Set<string>();
    let curr = parentMap.get(targetNodeID);
    while (curr) {
        ancestors.add(curr);
        curr = parentMap.get(curr);
    }

    // Now set didCollapse = true for all ancestors in graphicalTreeObj
    function setCollapseForAncestors(nodes: TreeNode[]) {
        for (let i = 0; i < nodes.length; i++) {
            if (ancestors.has(nodes[i].nodeID)) {
                nodes[i] = {
                    ...nodes[i],
                    didCollapse: true
                };
            }
            if (nodes[i].children && nodes[i].children.length > 0) {
                setCollapseForAncestors(nodes[i].children);
            }
        }
    }
    
    setCollapseForAncestors(graphicalTreeObj);
    return updateSyntaxTree("", true);
}

function setGraph() {
    const treeGraph = {
        id: "root",
        layoutOptions: LAYOUT_OPTIONS,
        children: nodeMembers,
        edges: nodeEdges,
        isLocateMode: checkNodePath
    };

    return { treeGraph, syntaxTreeObj };
}
