import React from "react";
import Avatar from "@material-ui/core/Avatar";
import styled from "styled-components";
import { CopyableTooltip } from "common/components/copyable-tooltip";
import { useAccountWallet } from "../../modules/tokens/hook/useAccountWallet";
import CircularProgress from "@material-ui/core/CircularProgress";
import numeral from "numeral";
import { PopoverMenu } from "../../common/components/popover-menu/PopoverMenu";
import { getPassphrase } from "../../services/PasswordService";
import { useWalletContext } from "../../common/context/WalletContext";

export function TokenItem({
  tab,
  tabName,
  item = {},
  onSendToken,
  handleUnfollow,
  onClickHistory
}) {
  const { wallet } = useWalletContext();
  const accountWallet = useAccountWallet();
  const [balance, setBalance] = React.useState(null);

  React.useEffect(() => {
    loadBalance(item.isInit);
  }, [item.ID]);

  async function loadBalance(isInit) {
    if (isInit) {
      setTimeout(async () => {
        try {
          let balance = null;
          if (tabName === "privacy") {
            balance = await accountWallet.getPrivacyCustomTokenBalance(item.ID);
          } else if (tabName === "custom") {
            balance = await accountWallet.getCustomTokenBalance(item.ID);
          }
          console.log(`TokenItem ${item.ID} load balance after 10s`, balance);
          //DANGEROUSLY MUTATE DATA IN HERE !!!!!!
          item.isInit = false;
          wallet.save(getPassphrase());

          setBalance(balance);
        } catch (e) {
          console.error(e);
          setBalance("#ERR");
        }
      }, 10000);
    } else {
      try {
        let balance = null;
        if (tabName === "privacy") {
          balance = await accountWallet.getPrivacyCustomTokenBalance(item.ID);
        } else if (tabName === "custom") {
          balance = await accountWallet.getCustomTokenBalance(item.ID);
        }
        setBalance(balance);
      } catch (e) {
        console.error(e);
        setBalance("#ERR");
      }
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
              {renderBalance(balance, item.isInit)}
            </div>
          </div>
        </CopyableTooltip>
      </Details>

      <Buttons>
        <PopoverMenu
          renderItems={closeMenu => {
            const { MenuItem } = PopoverMenu;
            return [
              <MenuItem key={1} onClick={onClickSendMenuItem(closeMenu)}>
                Send
              </MenuItem>,
              <MenuItem key={2} onClick={onClickUnfollowMenuItem(closeMenu)}>
                Unfollow
              </MenuItem>,
              <MenuItem key={3} onClick={onClickHistoryMenuItem(closeMenu)}>
                History
              </MenuItem>
            ];
          }}
        />
      </Buttons>
    </Wrapper>
  );
}

function renderBalance(balance, isInit) {
  if (typeof balance !== "number" || isInit) {
    return <CircularProgress size={20} />;
  }
  return numeral(parseFloat(balance)).format("0,0");
}

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
