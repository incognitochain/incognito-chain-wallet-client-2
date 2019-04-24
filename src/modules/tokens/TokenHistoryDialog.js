import React from "react";
import styled from "styled-components";
import { Modal } from "../../common/components/modal";
import { truncate } from "lodash";
import { useAccountWallet } from "./hook/useAccountWallet";
import { useDebugReducer } from "../../common/hook/useDebugReducer";
import {
  FailedTx,
  SuccessTx,
  ConfirmedTx,
  getTokenImage
} from "constant-chain-web-js/build/wallet";
import Avatar from "@material-ui/core/Avatar";
import moment from "moment";
import { formatTokenAmount } from "@src/common/utils/format";
import { hashToIdenticon } from "@src/services/RpcClientService";

function truncateMiddle(str = "") {
  return truncate(str, { length: 10 }) + str.slice(-4);
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
  }, [isOpen, accountWallet]);

  function onInit() {
    if (!accountWallet) return;

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

                let image = "";
                if (txID && txID.length > 0) {
                  image = hashToIdenticon(txID);
                }

                let createdTime = "";
                if (time != undefined && time != null) {
                  time = moment(time);
                  createdTime = time.format("DD/MM/YYYY - hh:mm:ss");
                }

                return (
                  <HistoryItem key={txID}>
                    <Div>
                      <Row1>
                        <TxID>
                          <a
                            href={process.env.CONSTANT_EXPLORER + "tx/" + txID}
                          >
                            <Avatar
                              alt={image && image.length > 0 ? txID : "fail"}
                              src={image}
                            />
                          </a>
                        </TxID>
                        <Time>{createdTime}</Time>
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
                          {isIn ? "+" : "-"} {formatTokenAmount(amount)}{" "}
                          {tokenName}
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
  font-size: 12px;
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
