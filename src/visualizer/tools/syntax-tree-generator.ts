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

let graphicalTreeObj: TreeNode[] = [];

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
