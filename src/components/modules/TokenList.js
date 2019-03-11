import React from "react";
import { TokenItem } from "./TokenItem";
import styled from "styled-components";

function TokenList(props) {
  const { list = [] } = props;
  return (
    <Wrapper className="wrapperTokenList TokenList">
      {list.length ? (
        list.map((item, index) => (
          <TokenItem key={item.ID} item={item} {...props} />
        ))
      ) : (
        <div className="wrapperTokenEmpty">
          <div className="emptyHeader">NO TOKEN.</div>
          <div className="emptyDes">
            You can always easily create your own one.
          </div>
        </div>
      )}
    </Wrapper>
  );
}

export default TokenList;

const Wrapper = styled.div`
  flex: 1;
  overflow: auto;
  padding-right: 2px;
`;
