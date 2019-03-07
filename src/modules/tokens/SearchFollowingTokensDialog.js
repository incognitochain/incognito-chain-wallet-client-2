import React from "react";
import styled from "styled-components";
import { Modal } from "../../common/components/modal";
import { Button, TextField } from "@material-ui/core";
import * as rpcClientService from "../../services/RpcClientService";
import _ from "lodash";
import cls from "classnames";
import { WithContext as ReactTags } from "react-tag-input";

const renderIf = cond => cmp => (cond ? cmp : null);

function truncateMiddle(str = "") {
  return _.truncate(str, { length: 15 }) + str.slice(-4);
}

function getIsSelected(token, selectedId) {
  if (token.ID !== selectedId) {
    return token.isSelected;
  } else {
    return !token.isSelected;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_TOKENS":
      return { ...state, tokens: action.tokens };
    case "SELECT_TOKEN":
      return {
        ...state,
        tokens: state.tokens.map(token => ({
          ...token,
          isSelected: getIsSelected(token, action.selectedId)
        }))
      };
    case "CHANGE_SEARCH_KEY":
      return { ...state, searchKey: action.searchKey };

    default:
      throw new Error();
  }
}

export function SearchFollowingTokensDialog({ tabName, isOpen, onClose }) {
  const [state, dispatch] = React.useReducer(reducer, {
    searchKey: "",
    tokens: []
  });

  React.useEffect(() => {
    isOpen && onInit();
  }, [isOpen]);

  async function onInit() {
    if (tabName === "privacy") {
      const result = await rpcClientService.listPrivacyTokens();
      dispatch({ type: "SET_TOKENS", tokens: result.listCustomToken });
    } else if (tabName === "custom") {
      const result = await rpcClientService.listCustomTokens();
      dispatch({ type: "SET_TOKENS", tokens: result.listCustomToken });
    }
  }

  function onClickItem(selectedId) {
    dispatch({ type: "SELECT_TOKEN", selectedId });
  }

  function onClickFollow() {}

  const suggestTokens = state.tokens.filter(
    token =>
      (token.Name + token.ID || "")
        .toUpperCase()
        .includes((state.searchKey || "").toUpperCase()) && !token.isSelected
  );

  const selectedTokens = state.tokens
    .filter(token => token.isSelected)
    .map(token => ({
      id: token.ID,
      text: token.Name
    }));

  return (
    <Modal title="Select Tokens to Follow" isOpen={isOpen} onClose={onClose}>
      <Wrapper>
        <Form noValidate>
          <TextField
            required
            type="search"
            label="Search Token by Name"
            margin="normal"
            variant="outlined"
            value={state.searchKey}
            onChange={e =>
              dispatch({ type: "CHANGE_SEARCH_KEY", searchKey: e.target.value })
            }
          />
        </Form>

        <List>
          {suggestTokens.length ? (
            suggestTokens.map((token, i) => {
              return (
                <Token
                  key={token.ID}
                  className={cls({ isSelected: token.isSelected })}
                  onClick={() => onClickItem(token.ID)}
                >
                  <Left>
                    <img src={token.Image} alt="token" />
                  </Left>
                  <Right>
                    <div>ID: {truncateMiddle(token.ID)}</div>
                    <div>Name: {token.Name}</div>
                    <div>Symbol: {token["Symbol"]}</div>
                    <div>Amount: {token.Amount}</div>
                  </Right>
                </Token>
              );
            })
          ) : (
            <div style={{ textAlign: "center", paddingTop: 20 }}>
              No token to select
            </div>
          )}
        </List>
        {renderIf(selectedTokens.length)(
          <Tags>
            <ReactTags
              allowDragDrop={false}
              tags={selectedTokens}
              handleDelete={i => {
                dispatch({
                  type: "SELECT_TOKEN",
                  selectedId: selectedTokens[i].id
                });
              }}
            />
          </Tags>
        )}
        <FollowButtonWrapper>
          <Button
            disabled={!selectedTokens.length}
            variant="contained"
            color="primary"
            onClick={onClickFollow}
          >
            Follow
          </Button>
        </FollowButtonWrapper>
      </Wrapper>
    </Modal>
  );
}

const Tags = styled.div`
  padding: 20px 20px;
  .ReactTags__tagInput {
    display: none;
  }
  /* Styles for selected tags */
  div.ReactTags__selected span.ReactTags__tag {
    border: 1px solid #ddd;
    background: #eee;
    font-size: 12px;
    display: inline-block;
    padding: 5px;
    margin: 0 5px;
    cursor: move;
    border-radius: 2px;
  }
  div.ReactTags__selected a.ReactTags__remove {
    color: #aaa;
    margin-left: 5px;
    cursor: pointer;
  }

  /* Styles for suggestions */
  div.ReactTags__suggestions {
    position: absolute;
  }
  div.ReactTags__suggestions ul {
    list-style-type: none;
    box-shadow: 0.05em 0.01em 0.5em rgba(0, 0, 0, 0.2);
    background: white;
    width: 200px;
  }
  div.ReactTags__suggestions li {
    border-bottom: 1px solid #ddd;
    padding: 5px 10px;
    margin: 0;
  }
  div.ReactTags__suggestions li mark {
    text-decoration: underline;
    background: none;
    font-weight: 600;
  }
  div.ReactTags__suggestions ul li.ReactTags__activeSuggestion {
    background: #b7cfe0;
    cursor: pointer;
  }
`;

const FollowButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 20px;
`;

const Left = styled.div`
  width: 50px;
  img {
    width: 50px;
    height: auto;
  }
`;
const Right = styled.div`
  flex: 1;
  padding-left: 16px;
`;

const Token = styled.div`
  display: flex;
  flex-direction: row;
  padding: 23px 20px;
  border-bottom: 1px solid #e4e7f2;
  cursor: pointer;

  &.isSelected {
    background-color: grey;
  }
`;

const List = styled.div`
  overflow: auto;
  max-height: 500px;
`;

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;
