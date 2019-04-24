import React from "react";
import styled from "styled-components";
import { Modal } from "../../common/components/modal";
import { useAccountWallet } from "./hook/useAccountWallet";
import { useDebugReducer } from "../../common/hook/useDebugReducer";
import { HistoryItem } from "@src/modules/history/HistoryItem";

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

  function compare(a, b) {
    if (a.time < b.time) return 1;
    if (a.time > b.time) return -1;
    return 0;
  }

  let history = state.history;
  history.sort(compare);

  return (
    <Modal
      title={(tabName === "privacy" ? "Privacy" : "Custom") + " Token History"}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Wrapper>
        <Scrollable>
          {history.length ? (
            history.map(item => {
              return <HistoryItem history={item} />;
            })
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

const Wrapper = styled.div`
  flex: 1;
  padding: 12px 20px;
  display: flex;
`;

const Scrollable = styled.div`
  overflow: auto;
  flex: 1;
`;
