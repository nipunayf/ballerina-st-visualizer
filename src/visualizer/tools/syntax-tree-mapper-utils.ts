import * as _ from "lodash";
import { INVALID_TOKEN } from "../resources/constants";
import type { TreeNode } from "../resources/tree-interfaces";
import { checkNodePath } from "./syntax-tree-generator";

export function assignProperties(node: TreeNode | any) {
    let preceedingNode: number | any = -1;

    for (let count = 0; count < node.children.length; count++) {
        if (preceedingNode < 0 && node.children[count].kind !== INVALID_TOKEN) {
            preceedingNode = count;
        }
        if (node.children[count].diagnostics.length) {
            node.diagnostics = node.diagnostics.concat(_.cloneDeep(node.children[count].diagnostics));
        }
        if (checkNodePath && !node.isNodePath) {
            if (node.children[count].isNodePath) {
                node.isNodePath = true;
                node.didCollapse = true;
            }
        }
    }

    if (preceedingNode >= 0) {
        node.leadingMinutiae = _.cloneDeep(node.children[preceedingNode].leadingMinutiae);
        node.trailingMinutiae = _.cloneDeep(node.children[node.children.length - 1].trailingMinutiae);
    }
}
