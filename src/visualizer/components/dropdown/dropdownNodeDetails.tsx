"use strict";
import {
    DIAGNOSTICS,
    ENDING_POS,
    ERROR_MESSAGE,
    INVALID_TOKEN,
    LEADING_MINUTIAE,
    MINUTIAE,
    NODE_KIND,
    NONE,
    STARTING_POS,
    TRAILING_MINUTIAE
} from "../../resources/constants";
import type { DropdownDetailsProps } from "../../resources/tree-interfaces";
import * as styles from "../../styles/dropdown-tree.styles";
import DropdownArrayDetails from "./detailsArrayCard";
import DropdownDetails from "./detailsCard";

function DropdownNodeDetails(props: DropdownDetailsProps) {
    const { treeNode } = props;

    return (
        <div style={styles.detailsBlockStyle}>
            {!treeNode && <text> {ERROR_MESSAGE} </text>}

            {treeNode && (
                <div>
                    {treeNode.value.length > 25 && treeNode.kind === INVALID_TOKEN && (
                        <DropdownDetails
                            title="Value"
                            value={treeNode.value}
                        />
                    )}

                    <DropdownDetails
                        title={NODE_KIND}
                        value={treeNode.kind}
                    />

                    {treeNode.position && (
                        <div>
                            <DropdownDetails
                                title={STARTING_POS}
                                value={"(" + treeNode.position.startLine + ", "
                                    + treeNode.position.startColumn + ")"}
                            />

                            <DropdownDetails
                                title={ENDING_POS}
                                value={"(" + treeNode.position.endLine + ", "
                                    + treeNode.position.endColumn + ")"}
                            />
                        </div>
                    )}

                    {(treeNode.leadingMinutiae && treeNode.leadingMinutiae.length > 0
                        && !(treeNode.leadingMinutiae.length === 1 && treeNode.leadingMinutiae[0].isInvalid)) && (
                            <DropdownArrayDetails
                                title={LEADING_MINUTIAE}
                                type={MINUTIAE}
                                value={treeNode.leadingMinutiae}
                            />
                        )}

                    {(!treeNode.leadingMinutiae || treeNode.leadingMinutiae.length < 1 ||
                        (treeNode.leadingMinutiae.length === 1 && treeNode.leadingMinutiae[0].isInvalid)) && (
                            <DropdownDetails
                                title={LEADING_MINUTIAE}
                                value={NONE}
                            />
                        )}

                    {treeNode.trailingMinutiae && treeNode.trailingMinutiae.length > 0 && (
                        <DropdownArrayDetails
                            title={TRAILING_MINUTIAE}
                            type={MINUTIAE}
                            value={treeNode.trailingMinutiae}
                        />
                    )}

                    {(!treeNode.trailingMinutiae || treeNode.trailingMinutiae.length < 1) && (
                        <DropdownDetails
                            title={TRAILING_MINUTIAE}
                            value={NONE}
                        />
                    )}

                    {treeNode.diagnostics && treeNode.diagnostics.length > 0 && (
                        <DropdownArrayDetails
                            title={DIAGNOSTICS}
                            type={DIAGNOSTICS}
                            value={treeNode.diagnostics}
                        />
                    )}

                    {(!treeNode.diagnostics || treeNode.diagnostics.length < 1) && (
                        <DropdownDetails
                            title={DIAGNOSTICS}
                            value={NONE}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default DropdownNodeDetails;
