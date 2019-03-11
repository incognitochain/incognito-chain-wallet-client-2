import React from "react";
import {Button} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import styled from "styled-components";
import {CopyableTooltip} from "common/components/copyable-tooltip";
import {useAccountWallet} from "../../modules/tokens/hook/useAccountWallet";
import CircularProgress from "@material-ui/core/CircularProgress";
import numeral from "numeral";

export function TokenItem({
                            tab,
                            tabName,
                            item = {},
                            onSendToken,
                            handleUnfollow
                          }) {
  const accountWallet = useAccountWallet();
  const [balance, setBalance] = React.useState(null);

  React.useEffect(() => {
    loadBalance();
  }, [item.ID]);

  async function loadBalance() {
    try {
      if (tabName === "privacy") {
        console.log("### load privacy balance", item.ID);
        const balance = await accountWallet.getPrivacyCustomTokenBalance(
          item.ID
        );
        setBalance(balance);
      } else if (tabName === "custom") {
        console.log("### load custom balance");
        const balance = await accountWallet.getCustomTokenBalance(item.ID);
        setBalance(balance);
      }
    } catch (e) {
      console.error(e);
      setBalance("#ERR");
    }
  }

  const handleClickButton = () => {
    onSendToken(item, tab);
  };

  return (
    <Wrapper className="wrapperToken">
      <Avatar alt="avatar" src={item.Image}/>
      <Details>
        <CopyableTooltip title={item.ID}>
          <div className="wrapperTokenDetail">
            <div className="tokenName">{item.Name}</div>
            <div className="tokenAmount">
              {balance === null ? (
                <CircularProgress size={20}/>
              ) : (
                numeral(parseFloat(balance)).format("0,0")
              )}
            </div>
          </div>
        </CopyableTooltip>
      </Details>

      <Buttons>
        <StyledButton
          variant="contained"
          size="medium"
          className="tokenButton"
          onClick={handleClickButton}
        >
          Send
        </StyledButton>
        <div style={{height: 3}}/>

        <StyledButton
          variant="contained"
          size="medium"
          className="tokenButton"
          onClick={() => handleUnfollow(item)}
        >
          Unfollow
        </StyledButton>
      </Buttons>
    </Wrapper>
  );
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
  align-items: stretch;
`;

const Details = styled.div`
  flex: 1;
  display: flex;
  cursor: pointer;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
`;
