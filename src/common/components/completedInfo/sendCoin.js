import React from "react";
import { truncLongText, formatDate } from "@src/common/utils/format";
import { BigDate } from "./styled";
import CompletedInfo, { STATUS } from "./index";
import constants from "../../../constants";

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
    <span>
      Amount:{" "}
      <b>
        {Number(amount) || 0} {constants.NATIVE_COIN}
      </b>
    </span>
    <span>To: {truncLongText(toAddress)}</span>
    <span>Tx ID: {truncLongText(txId)}</span>
    <span>
      Create at: <BigDate>{formatDate(createdAt)}</BigDate>
    </span>
  </CompletedInfo>
);

export default SendCoinInfo;
