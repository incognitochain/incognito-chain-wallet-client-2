import React from "react";
import styled from "styled-components";
import { Modal } from "../../common/components/modal";
import { Button, TextField } from "@material-ui/core";
import * as rpcClientService from "../../services/RpcClientService";
import _ from "lodash";
import cls from "classnames";
import { WithContext as ReactTags } from "react-tag-input";
import { useWalletContext } from "../../common/context/WalletContext";
import { useAccountContext } from "../../common/context/AccountContext";

const renderIf = cond => cmp => (cond ? cmp : null);

function truncateMiddle(str = "") {
  return _.truncate(str, { length: 15 }) + str.slice(-4);
}

const initialState = {
  searchKey: "",
  tokens: []
};

function reducer(state, action) {
  switch (action.type) {
    case "RESET":
      return initialState;
    default:
      throw new Error();
  }
}

export function FollowTokenDialog({
  followedTokens = [],
  tabName,
  isOpen,
  onClose,
  refreshTokenList
}) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const { wallet } = useWalletContext();
  const account = useAccountContext();

  React.useEffect(() => {
    isOpen && onInit();
  }, [isOpen]);

  async function onInit() {
    dispatch({ type: "RESET" });
    if (tabName === "privacy") {
      const result = await rpcClientService.listPrivacyTokens();
      dispatch({ type: "SET_TOKENS", tokens: result.listCustomToken });
    } else if (tabName === "custom") {
      const result = await rpcClientService.listCustomTokens();
      dispatch({ type: "SET_TOKENS", tokens: result.listCustomToken });
    }
  }

  return (
    <Modal title="Token History" isOpen={isOpen} onClose={onClose}>
      <Wrapper>Token history</Wrapper>
    </Modal>
  );
}

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
