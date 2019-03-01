import React from "react";
import PropTypes from "prop-types";
import { TokenItem } from "./TokenItem";
import styled from "styled-components";

class TokenList extends React.Component {
  static propTypes = {
    list: PropTypes.array.isRequired
  };
  renderEmpty = list => {
    if (list.length > 0) return null;
    return (
      <div className="wrapperTokenEmpty">
        <div className="emptyHeader">NO TOKEN PRIVACY.</div>
        <div className="emptyDes">
          You can always easily create your own one.
        </div>
      </div>
    );
  };
  render() {
    const { list } = this.props;
    return (
      <Wrapper className="wrapperTokenList">
        {this.renderEmpty(list)}
        {list.map((item, index) => (
          <TokenItem key={index} item={item} {...this.props} />
        ))}
      </Wrapper>
    );
  }
}
export default TokenList;

const Wrapper = styled.div``;
