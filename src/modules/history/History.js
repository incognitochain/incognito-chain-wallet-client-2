import React from "react";
import styled from "styled-components";
import { useAccountContext } from "../../common/context/AccountContext";
import { useWalletContext } from "../../common/context/WalletContext";
import { HistoryItem } from "@src/modules/history/HistoryItem";

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
export function History({ onSendConstant }) {
  const [state, dispatch] = React.useReducer(reducer, {
    history: []
  });

  let account = useAccountContext();
  let { wallet } = useWalletContext();

  React.useEffect(() => {
    loadHistory();
  }, [account]);

  async function loadHistory() {
    console.log("Load history when change account!!!!");
    let history = await wallet.getHistoryByAccount(account.name);
    dispatch({
      type: "SET_HISTORY",
      history
    });
  }

  function compare(a, b) {
    if (a.time < b.time) return 1;
    if (a.time > b.time) return -1;
    return 0;
  }

  let history = state.history;
  history.sort(compare);
  return (
    <Wrapper>
      <Container>
        {history.length ? (
          history.map(item => {
            return (
              <HistoryItem history={item} onSendConstant={onSendConstant} />
            );
          })
        ) : (
          <NoData>Nothing here yet. Time to make history.</NoData>
        )}
      </Container>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  flex: 1;
  padding: 12px 20px;
  display: flex;
`;

const Container = styled.div`
  flex: 1;
`;

const NoData = styled.div`
  text-align: center;
  margin: 20px;
`;
