import React from "react";
import CompletedInfo, { STATUS } from "./index";

const CreatedTokenInfo = ({ onClose, completedInfoProps }) => (
  <CompletedInfo
    {...completedInfoProps}
    title="Created Token"
    type={STATUS.SUCCESSED}
  >
    <span>The new token was created</span>
  </CompletedInfo>
);

export default CreatedTokenInfo;
