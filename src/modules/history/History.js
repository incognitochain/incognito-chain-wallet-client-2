import React from "react";
import styled from "styled-components";
// import { useAccountContext } from "../../common/context/AccountContext";
import _ from "lodash";
import { useAccountContext } from "../../common/context/AccountContext";
import { useWalletContext } from "../../common/context/WalletContext";

function truncateMiddle(str = "") {
  return _.truncate(str, { length: 15 }) + str.slice(-4);
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_HISTORY":
      return {
        ...state,
        history: action.history
      };
    default:
      throw new Error();
  }
}
/**
 * NOTE: Only show sending history for now
 */
export function History() {
  const [state, dispatch] = React.useReducer(reducer, {
    history: []
  });

  let account = useAccountContext();
  let { wallet } = useWalletContext();

  React.useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    let history = await wallet.getHistoryByAccount(account.name);
    dispatch({
      type: "SET_HISTORY",
      history
    });
  }

  return (
    <Wrapper>
      <Scrollable>
        {state.history.map(item => {
          return (
            <HistoryItem key={item.txID}>
              <TxID>TxID: {truncateMiddle(item.txID)}</TxID>
              <Div>
                <Left>
                  {(item.receivers || []).map((receiverItem, i) => {
                    return (
                      <Receiver key={i}>
                        {truncateMiddle(receiverItem)}
                      </Receiver>
                    );
                  })}
                </Left>
                <Right>
                  {" "}
                  {item.isIn ? "+" : "-"} {item.amount} Constant
                </Right>
              </Div>
              <Fee>Fee: {item.fee}</Fee>
            </HistoryItem>
          );
        })}
      </Scrollable>
    </Wrapper>
  );
}

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
