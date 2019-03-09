import React from "react";
import styled from "styled-components";
import { Modal } from "../../common/components/modal";
import _ from "lodash";
import { useAccountWallet } from "./hook/useAccountWallet";

function truncateMiddle(str = "") {
  return _.truncate(str, { length: 15 }) + str.slice(-4);
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

export function TokenHistoryDialog({ tabName, isOpen, onClose }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const accountWallet = useAccountWallet();

  React.useEffect(() => {
    isOpen && onInit();
  }, [isOpen]);

  function onInit() {
    dispatch({ type: "RESET" });
    if (tabName === "privacy") {
      const history = accountWallet.getPrivacyCustomTokenTrx();
      dispatch({ type: "SET_HISTORY", history });
    } else if (tabName === "custom") {
      const history = accountWallet.getCustomTokenTrx();
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
              ({ txID, receivers = [], amount, tokenName, fee }) => {
                return (
                  <HistoryItem key={txID}>
                    <TxID>TxID: {truncateMiddle(txID)}</TxID>
                    <Div>
                      <Left>
                        {receivers.map((receiverItem, i) => {
                          return (
                            <Receiver key={i}>
                              {truncateMiddle(receiverItem)}
                            </Receiver>
                          );
                        })}
                      </Left>
                      <Right>
                        -{amount} {tokenName}
                      </Right>
                    </Div>
                    <Fee>Fee: {fee}</Fee>
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
  color: #838aa7;
  font-size: 14px;
  margin-top: 18px;
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
  padding: 23px 0px;
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
`;

const Div = styled.div`
  display: flex;
  flex-direction: row;
`;

const Left = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Right = styled.div`
  flex: 1;
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  color: #050c33;
`;
