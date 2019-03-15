import React from "react";
import styled from "styled-components";
import { Modal } from "../../common/components/modal";
import _ from "lodash";
import { useAccountWallet } from "./hook/useAccountWallet";
import { useDebugReducer } from "../../common/hook/useDebugReducer";
import {
  FailedTx,
  SuccessTx,
  ConfirmedTx,
  genImageFromStr
} from "constant-chain-web-js/build/wallet";
import Avatar from "@material-ui/core/Avatar";

//TODO: update url
// const url = "http://explorer.constant.money:3002/tx/cf934f9b61f97d4937d82e9a0564a6a8101f622aa16f6bf7d823f2fe83ec3f45"
const url = "https://constant.money/";

function truncateMiddle(str = "") {
  return _.truncate(str, { length: 10 }) + str.slice(-4);
}

const initialState = {
  history: []
};

function reducer(state, action) {
  switch (action.type) {
    case "RESET":
      return initialState;
    case "SET_HISTORY":
      return {
        ...state,
        history: action.history
      };
    default:
      throw new Error("Unhandled action type " + action.type);
  }
}

export function TokenHistoryDialog({ tokenId, tabName, isOpen, onClose }) {
  const [state, dispatch] = useDebugReducer(
    TokenHistoryDialog.name,
    reducer,
    initialState
  );

  const accountWallet = useAccountWallet();

  React.useEffect(() => {
    isOpen && onInit();
  }, [isOpen]);

  function onInit() {
    dispatch({ type: "RESET" });
    if (tabName === "privacy") {
      const history = accountWallet.getPrivacyCustomTokenTrxByTokenID(tokenId);
      dispatch({ type: "SET_HISTORY", history });
    } else if (tabName === "custom") {
      const history = accountWallet.getCustomTokenTrxByTokenID(tokenId);
      dispatch({ type: "SET_HISTORY", history });
    }
  }

  return (
    <Modal
      title={(tabName === "privacy" ? "Privacy" : "Custom") + " Token History"}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Wrapper>
        <Scrollable>
          {state.history.length ? (
            state.history.map(
              ({
                txID,
                receivers = [],
                amount,
                tokenName,
                fee,
                isIn,
                time,
                status
              }) => {
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
                const image = genImageFromStr(txID, 40);

                return (
                  <HistoryItem key={txID}>
                    <Div>
                      <Row1>
                        <TxID>
                          <a href={url}>
                            <Avatar alt="tx" src={image} />
                          </a>
                        </TxID>

                        <Time>Date: {time.toString()}</Time>
                      </Row1>

                      <Row2>
                        <Left>
                          {receivers.map((receiverItem, i) => {
                            return (
                              <Receiver key={i}>
                                To: {truncateMiddle(receiverItem)}
                              </Receiver>
                            );
                          })}
                        </Left>
                        <Right>
                          {" "}
                          {isIn ? "+" : "-"} {amount} {tokenName}
                        </Right>
                      </Row2>

                      <Row3>
                        <Left>
                          <Fee>Fee: {fee}</Fee>
                        </Left>
                        <Right>
                          <Status className={statusClass}>
                            <p>{statusText}</p>
                          </Status>
                        </Right>
                      </Row3>
                    </Div>
                  </HistoryItem>
                );
              }
            )
          ) : (
            <NoData>No data to display</NoData>
          )}
        </Scrollable>
      </Wrapper>
    </Modal>
  );
}

const NoData = styled.div`
  text-align: center;
  margin: 20px;
`;

const Fee = styled.div`
  color: #050c33;
  font-size: 16px;
`;

const Wrapper = styled.div`
  flex: 1;
  padding: 12px 20px;
  display: flex;
`;

const Scrollable = styled.div`
  overflow: auto;
  flex: 1;
`;

const HistoryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0px 0px;
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
  border: 1px solid black;
  border-radius: 5px;

  text-align: center;
  margin: auto;
  width: 50%;
  margin-right: 0;
  height: 100%;

  &.success {
    color: #4f8a10;
    background-color: #dff2bf;
  }
  &.failed {
    color: #d8000c;
    background-color: #ffd2d2;
  }
  &.confirmed {
    color: #00529b;
    background-color: #bde5f8;
  }
`;

const Left = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 50px;
  margin: auto;
`;

const Time = styled.div`
  color: #050c33;
  margin: auto;
  margin-left: 30px;
`;

const Row1 = styled.div`
  color: #00529b;
  display: flex;
  flex-direction: row;
  height: 50px;
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
