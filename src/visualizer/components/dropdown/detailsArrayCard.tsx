"use strict";
import { MINUTIAE } from "../../resources/constants";
import type { DetailsArrayCardProp } from "../../resources/tree-interfaces";
import * as styles from "../../styles/dropdown-tree.styles";

function DropdownArrayDetails(props: DetailsArrayCardProp) {
    const { title, type, value } = props;

    return (
        <div style={styles.detailsCardStyle}>
            <div style={styles.detailsCardTitleStyle}>
                {title}
            </div>

            {value && (
                <div style={styles.detailsArrayValueBlock}>
                    {value.map((item, id) => (
                        <>
                            {type === MINUTIAE && !item.isInvalid && (
                                <div
                                    key={id}
                                    style={styles.detailsCardValueStyle}
                                >
                                    - {item.kind}
                                </div>
                            )}

                            {type !== MINUTIAE && (
                                <div
                                    key={id}
                                    style={styles.detailsCardValueStyle}
                                >
                                    - {item.message}
                                </div>
                            )}
                        </>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DropdownArrayDetails;
