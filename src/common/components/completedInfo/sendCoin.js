import React from "react";
import { truncLongText } from "@src/common/utils/format";
import { BigDate } from "./styled";
import CompletedInfo, { STATUS } from "./index";

const SendCoinInfo = ({
  onClose,
  amount,
  toAddress,
  txId,
  createdAt,
  completedInfoProps
}) => (
  <CompletedInfo
    {...completedInfoProps}
    title={`Sent ${txId ? "Successfully" : "Failed"}`}
    type={txId ? STATUS.SUCCESSED : STATUS.FAILED}
  >
    <span>Amount: {Number(amount) || 0} CONST</span>
    <span>To: {truncLongText(toAddress)}</span>
    <span>Tx ID: {truncLongText(txId)}</span>
    <span>
      Create at: <BigDate>{new Date(createdAt)?.toLocaleString()}</BigDate>
    </span>
  </CompletedInfo>
);

export default SendCoinInfo;
