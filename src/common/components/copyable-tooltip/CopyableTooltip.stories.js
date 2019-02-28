import React from "react";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { linkTo } from "@storybook/addon-links";

import CopyableTooltip from "./CopyableTooltip";
import "toastr/build/toastr.css";

/**
 * A demo for react storybook
 */
storiesOf("CopyableTooltip", module).add("default", () => (
  <CopyableTooltip title={"00000001010100101200102010201010"}>
    Hover me!
  </CopyableTooltip>
));
