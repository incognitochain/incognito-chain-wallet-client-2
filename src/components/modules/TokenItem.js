import React from "react";
// import { Button } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import styled from "styled-components";
import { CopyableTooltip } from "common/components/copyable-tooltip";
import { useAccountWallet } from "../../modules/tokens/hook/useAccountWallet";
import CircularProgress from "@material-ui/core/CircularProgress";
import numeral from "numeral";
import { PopoverMenu } from "../../common/components/popover-menu/PopoverMenu";

export function TokenItem({
  tab,
  tabName,
  item = {},
  onSendToken,
  handleUnfollow,
  onClickHistory
}) {
  const accountWallet = useAccountWallet();
  const [balance, setBalance] = React.useState(null);

  React.useEffect(() => {
    loadBalance();
  }, [item.ID]);

  async function loadBalance() {
    try {
      if (tabName === "privacy") {
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

  const onClickSendMenuItem = closeMenu => () => {
    onSendToken(item, tab);
    closeMenu();
  };

  const onClickUnfollowMenuItem = closeMenu => () => {
    handleUnfollow(item);
    closeMenu();
  };

  const onClickHistoryMenuItem = closeMenu => () => {
    onClickHistory(item);
    closeMenu();
  };

  const { Image, ID, Name } = item;

  return (
    <Wrapper className="wrapperToken">
      <Avatar alt="avatar" src={Image} />
      <Details>
        <CopyableTooltip title={ID}>
          <div className="wrapperTokenDetail">
            <div className="tokenName">{Name}</div>
            <div className="tokenAmount">
              {balance === null ? (
                <CircularProgress size={20} />
              ) : (
                numeral(parseFloat(balance)).format("0,0")
              )}
            </div>
          </div>
        </CopyableTooltip>
      </Details>

      <Buttons>
        <PopoverMenu
          renderItems={closeMenu => {
            const { MenuItem } = PopoverMenu;
            return (
              <>
                <MenuItem onClick={onClickSendMenuItem(closeMenu)}>
                  Send
                </MenuItem>
                <MenuItem onClick={onClickUnfollowMenuItem(closeMenu)}>
                  Unfollow
                </MenuItem>
                <MenuItem onClick={onClickHistoryMenuItem(closeMenu)}>
                  History
                </MenuItem>
              </>
            );
          }}
        />
        {/* <StyledButton
          // variant="contained"
          size="small"
          onClick={handleClickButton}
        >
          Send
        </StyledButton>
        <div style={{ height: 3 }} />

        <StyledButton
          // variant="contained"
          size="small"
          onClick={() => handleUnfollow(item)}
        >
          Unfollow
        </StyledButton>

        <StyledButton size="small" onClick={() => onClickHistory(item)}>
          History
        </StyledButton> */}
      </Buttons>
    </Wrapper>
  );
}

// const StyledButton = styled(Button)`
//   &.copy {
//     font-size: 9px;
//   }
// `;

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
