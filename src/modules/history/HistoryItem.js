import React from "react";
import styled from "styled-components";
import { truncate } from "lodash";
import { useAccountContext } from "../../common/context/AccountContext";
import { useWalletContext } from "../../common/context/WalletContext";
import {
  SuccessTx,
  ConfirmedTx,
  toNanoPRV
} from "incognito-chain-web-js/build/wallet";
import Avatar from "@material-ui/core/Avatar";
import SendCoinCompletedInfo from "@src/common/components/completedInfo/sendCoin";
import {
  formatPRVAmount,
  formatDate,
  formatTokenAmount
} from "@src/common/utils/format";
import { OptionMenu } from "@src/common/components/popover-menu/OptionMenu";
import { hashToIdenticon } from "@src/services/RpcClientService";
import Dialog from "@src/components/core/Dialog";
import constants from "../../constants";

import Account from "@src/services/Account";
import toastr from "toastr";

const url = `${process.env.CONSTANT_EXPLORER}/tx/`;

function truncateMiddle(str = "") {
  return truncate(str, { length: 10 }) + str.slice(-4);
}

/**
 * NOTE: Only show sending history for now
 */
export function HistoryItem({ history, onSendConstant }) {
  const [dialogContent, setDialogContent] = React.useState(null);
  const [identicon, setIdenticon] = React.useState(null);
  const [dialog, setDialog] = React.useState(null);

  let account = useAccountContext();
  let { wallet } = useWalletContext();

  React.useEffect(() => {
    async function getIdenticon() {
      if (history.txID && history.txID.length > 0) {
        let res = await hashToIdenticon([history.txID]);
        setIdenticon(res[0]);
      }
    }

    getIdenticon();
  }, []);

  function showHistoryDialog(history, receiverAddress) {
    setDialogContent(
      <SendCoinCompletedInfo
        onClose={() => null}
        amount={formatPRVAmount(history?.amount)}
        toAddress={receiverAddress}
        txId={history?.txID}
        createdAt={history?.time}
        completedInfoProps={{
          isPrivacy: history.isPrivacy === 1
        }}
      />
    );
    dialog && dialog.open();
  }

  function onClickResendMenuItem(history) {
    if (!history) {
      return;
    }
    let props = {
      toAddress: history.receivers[0],
      amount: formatPRVAmount(history.amount),
      isPrivacy: Number(history.isPrivacy).toString()
    };
    onSendConstant(account, props);
  }

  async function onClickCancelMenuItem(history) {
    if (!history) {
      return;
    }
    console.log("Account: ", account);
    console.log("wallet: ", wallet);

    let response;
    try {
      response = await Account.cancelTx(
        history.txID,
        toNanoPRV(history.fee) * 2,
        history.feePToken * 2,
        account,
        wallet
      );
    } catch (e) {
      console.log("Cancel transaction error: ", e);
      toastr.error("Cancel transaction failed. Please try again!");
    }

    if (response && response.txId != null) {
      toastr.info("Cancel transaction success.");
    } else {
      toastr.error("Cancel transaction failed. Please try again!");
    }
  }

  const itemsForPRV = [
    { key: 1, onclick: () => onClickResendMenuItem(history), text: "Resend" },
    { key: 2, onclick: () => onClickCancelMenuItem(history), text: "Cancel" }
  ];

  const itemsForToken = [
    { key: 1, onclick: () => onClickCancelMenuItem(history), text: "Cancel" }
  ];

  let createdTime = "";
  if (history.time !== undefined && history.time != null) {
    createdTime = formatDate(history.time);
  }
  // console.log("Time:", createdTime);
  const { status } = history;
  let statusText;
  let statusClass;

  if (status === ConfirmedTx) {
    statusText = "Confirmed";
    statusClass = "confirmed";
  } else if (status === SuccessTx) {
    statusText = "Success";
    statusClass = "success";
  } else {
    statusText = "Failed";
    statusClass = "failed";
  }

  // console.log("Image: ", identicon);
  // console.log("history.tokenName: ", history.tokenName);

  return (
    <Item key={history.txID}>
      <Div>
        <Row1>
          <div style={{ display: "flex" }}>
            <TxID>
              <a href={url + history.txID} target="_blank">
                <Avatar
                  alt={
                    identicon && identicon.length > 0 ? history.txID : "fail"
                  }
                  src={identicon}
                />
              </a>
            </TxID>

            <Time>{createdTime}</Time>
          </div>
          <OptionMenu
            items={history.tokenName === "" ? itemsForPRV : itemsForToken}
          />
        </Row1>

        <Row2>
          <Left>
            {(history.receivers || []).map((receiverItem, i) => {
              return (
                <Receiver
                  title={receiverItem}
                  key={i}
                  onClick={() => showHistoryDialog(history, receiverItem)}
                >
                  To: {truncateMiddle(receiverItem)}
                </Receiver>
              );
            })}
          </Left>
          <Right>
            {history.isIn ? "+" : "-"}{" "}
            {history.tokenName !== ""
              ? formatTokenAmount(history.amount)
              : formatPRVAmount(history.amount)}{" "}
            {history.tokenName !== ""
              ? history.tokenName
              : constants.NATIVE_COIN}
          </Right>
        </Row2>

        <Row3>
          <Left>
            <Fee>Fee: {history.fee}</Fee>
          </Left>
          <Right>
            <Status className={statusClass}>
              <p>{statusText}</p>
            </Status>
          </Right>
        </Row3>
      </Div>
      <Dialog title="History" onRef={setDialog} className={{ margin: 0 }}>
        {dialogContent}
      </Dialog>
    </Item>
  );
}

const Fee = styled.div`
  color: #050c33;
  font-size: 12px;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 10px 0px;
  border-bottom: 1px solid #e4e7f2;
`;

const TxID = styled.div`
  margin-bottom: 18px;
  color: #838aa7;
  font-size: 14px;
`;

const Receiver = styled.div`
  font-size: 16px;
  color: #050c33;
  flex: 1;
  display: flex;
  cursor: pointer;
`;

const Div = styled.div`
  display: flex;
  flex-direction: column;
`;

const Right = styled.div`
  flex: 1;
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  color: #050c33;
  margin: auto;
  height: 100%;
`;

const Status = styled.div`
  text-align: center;
  margin: auto;
  width: 50%;
  margin-right: 0;
  height: 100%;
  font-size: 12px;
  &.success {
    color: #8bc34a;
  }
  &.failed {
    color: #e53935;
  }
  &.confirmed {
    color: #dce775;
  }
`;

const Left = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 50px;
  margin: auto;
  padding: 0px !important;
  margin: 0px !important;
`;

const Time = styled.div`
  color: #050c33;
  margin: 10px 0px 0px 10px;
  font-size: 13px;
  display: flex;
  flex-direction: column;
`;

const Row1 = styled.div`
  color: #00529b;
  flex-direction: row;
  height: 50px;
  display: flex;
  justify-content: space-between;
`;

const Row2 = styled.div`
  color: #00529b;
  display: flex;
  flex-direction: row;
  height: 40px;
`;
const Row3 = styled.div`
  color: #00529b;
  display: flex;
  flex-direction: row;
  height: 40px;
`;
