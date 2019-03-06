import React from "react";
import styled from "styled-components";
// import { useAccountContext } from "../../common/context/AccountContext";
import _ from "lodash";

function truncateMiddle(str = "") {
  return _.truncate(str, { length: 15 }) + str.slice(-4);
}
/**
 * NOTE: Only show sending history for now
 */
export function History() {
  console.error("TODO - show real history");

  const history = [
    {
      txID:
        "1Uv2GdF6kBKvb4tQPsHaN4oHU7vHZAjgqyCEdKkKjAHKj986DhLiw3VKUwYWBBH8hDKHhnkgm3Vkd5VLRbYAKFeTXVvGcTWjHjZkwvxog",
      receiver: [
        "1Uv2GdF6kBKvb4tQPsHaN4oHU7vHZAjgqyCEdKkKjAHKj986DhLiw3VKUwYWBBH8hDKHhnkgm3Vkd5VLRbYAKFeTXVvGcTWjHjZkwvxog",
        "1Uv2GdF6kBKvb4tQPsHaN4oHU7vHZAjgqyCEdKkKjAHKj986DhLiw3VKUwYWBBH8hDKHhnkgm3Vkd5VLRbYAKFeTXVvGcTWjHjZkwvxog"
      ],
      amount: 10000,
      fee: 100
    },
    {
      txID:
        "2Uv2GdF6kBKvb4tQPsHaN4oHU7vHZAjgqyCEdKkKjAHKj986DhLiw3VKUwYWBBH8hDKHhnkgm3Vkd5VLRbYAKFeTXVvGcTWjHjZkwvxog",
      receiver: [
        "1Uv2GdF6kBKvb4tQPsHaN4oHU7vHZAjgqyCEdKkKjAHKj986DhLiw3VKUwYWBBH8hDKHhnkgm3Vkd5VLRbYAKFeTXVvGcTWjHjZkwvxog",
        "1Uv2GdF6kBKvb4tQPsHaN4oHU7vHZAjgqyCEdKkKjAHKj986DhLiw3VKUwYWBBH8hDKHhnkgm3Vkd5VLRbYAKFeTXVvGcTWjHjZkwvxog"
      ],
      amount: 10000,
      fee: 100
    }
  ];

  return (
    <Wrapper>
      <Scrollable>
        {history.map(item => {
          return (
            <HistoryItem key={item.txID}>
              <TxID>{truncateMiddle(item.txID)}</TxID>
              <Div>
                <Left>
                  {item.receiver.map((receiverItem, i) => {
                    return (
                      <Receiver key={i}>
                        {truncateMiddle(receiverItem)}
                      </Receiver>
                    );
                  })}
                </Left>
                <Right>-{item.amount} Constant</Right>
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
