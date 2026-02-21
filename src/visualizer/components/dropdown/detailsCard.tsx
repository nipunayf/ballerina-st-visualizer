"use strict";
import type { DetailsCardProp } from "../../resources/tree-interfaces";
import * as styles from "../../styles/dropdown-tree.styles";

function DropdownDetails(props: DetailsCardProp) {
    const { title, value } = props;

    return (
        <div
            style={{
                ...styles.detailsCardStyle,
                minHeight: 45
            }}
        >
            <div style={styles.detailsCardTitleStyle}>
                {title}
            </div>

            <div style={styles.detailsCardValueStyle}>
                {value}
            </div>
        </div>
    );
}

export default DropdownDetails;
