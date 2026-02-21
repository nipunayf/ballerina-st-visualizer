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
import GraphicalTree from "./representations/graphicalTree";
import { ERROR_MESSAGE } from "./resources/constants";
import type { PrimaryProps, TreeGraph } from "./resources/tree-interfaces";
import * as styles from "./styles/primary.styles";

function SyntaxTree(props: PrimaryProps) {
    const { onFindNode, onCollapseTree, renderTree, renderKey } = props;

    const [responseStatus, setResponseStatus] = useState(true);
    const [graphicalTree, setGraphicalTree] = useState<TreeGraph | undefined>(undefined);

    useEffect(() => {
        renderTree().then((result) => {
            if (result.treeArray && result.treeGraph) {
                setResponseStatus(true);
                setGraphicalTree(result.treeGraph);
            } else {
                setResponseStatus(false);
            }
        }).catch(() => {
            setResponseStatus(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [renderKey, renderTree]);



    return (
        <div style={styles.bodyStyle}>
            {responseStatus && (
                <div style={{ ...styles.bodyStyle, marginTop: 30 }}>
                    {graphicalTree && (
                        <GraphicalTree
                            treeGraph={graphicalTree}
                            onCollapseTree={onCollapseTree}
                            onFindNode={onFindNode}
                        />
                    )}

                    {!graphicalTree && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                border: "3px solid rgba(32,182,176,0.2)",
                                borderTop: "3px solid #20b6b0",
                                borderRadius: "50%",
                                animation: "st-spin 0.8s linear infinite"
                            }} />
                            <style>{`@keyframes st-spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}
                </div>
            )}

            {!responseStatus && (
                <p style={styles.errorStyle}> {ERROR_MESSAGE} </p>
            )}
        </div>
    );
}

export default SyntaxTree;
