import React from "react";
import styled from "styled-components";
// import { useAccountContext } from "../../common/context/AccountContext";
import _ from "lodash";
import { useAccountContext } from "../../common/context/AccountContext";
import { useWalletContext } from "../../common/context/WalletContext";
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
          console.log("Time:", item.time);
          const { status } = item;
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
          const image = genImageFromStr(item.txID, 40);
          return (
            <HistoryItem key={item.txID}>
              <Div>
                <Row1>
                  <TxID>
                    <a href={url}>
                      <Avatar alt="tx" src={image} />
                    </a>
                  </TxID>

                  <Time>Date: {item.time}</Time>
                </Row1>

                <Row2>
                  <Left>
                    {(item.receivers || []).map((receiverItem, i) => {
                      return (
                        <Receiver key={i}>
                          To: {truncateMiddle(receiverItem)}
                        </Receiver>
                      );
                    })}
                  </Left>
                  <Right>
                    {" "}
                    {item.isIn ? "+" : "-"} {item.amount} CONST
                  </Right>
                </Row2>

                <Row3>
                  <Left>
                    <Fee>Fee: {item.fee}</Fee>
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
        })}
      </Scrollable>
    </Wrapper>
  );
}

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
