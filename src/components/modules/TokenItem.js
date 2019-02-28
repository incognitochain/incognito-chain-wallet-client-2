import React from "react";
import PropTypes from "prop-types";
import { Button } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import styled from "styled-components";
import { CopyableTooltip } from "common/components/copyable-tooltip";

export class TokenItem extends React.Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    onSendToken: PropTypes.func
  };
  static defaultProps = {};
  handleClickButton = () => {
    const { onSendToken, item, tab } = this.props;
    onSendToken(item, tab);
  };

  render() {
    const { item } = this.props;
    const { Amount, Name, TokenImage } = item;
    return (
      <Wrapper className="wrapperToken">
        <Avatar alt="avatar" src={TokenImage} />
        <Details>
          <CopyableTooltip title={item.TokenID}>
            <div className="wrapperTokenDetail">
              <div className="tokenName">{Name}</div>
              <div className="tokenAmount">{Amount.toLocaleString()}</div>
            </div>
          </CopyableTooltip>
        </Details>

        <Buttons>
          <StyledButton
            variant="contained"
            size="medium"
            className="tokenButton"
            onClick={this.handleClickButton}
          >
            Send
          </StyledButton>
        </Buttons>
      </Wrapper>
    );
  }
}

const StyledButton = styled(Button)`
  &.copy {
    font-size: 9px;
  }
`;

const Wrapper = styled.div`
  border-bottom: solid 1px #e4e7f2;
  padding-bottom: 10px;
  display: flex;
  flex-direction: row;
`;

const Details = styled.div`
  flex: 1;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
`;
