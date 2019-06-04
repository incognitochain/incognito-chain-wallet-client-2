import React from "react";
import Avatar from "@material-ui/core/Avatar";
import styled from "styled-components";
import { CopyableTooltip } from "@common/components/copyable-tooltip";
import { useAccountWallet } from "../../modules/tokens/hook/useAccountWallet";
import CircularProgress from "@material-ui/core/CircularProgress";
import { getPassphrase } from "../../services/PasswordService";
import { useWalletContext } from "../../common/context/WalletContext";
import { formatTokenAmount } from "@src/common/utils/format";
import { OptionMenu } from "@src/common/components/popover-menu/OptionMenu";
import { hashToIdenticon } from "@src/services/RpcClientService";

export async function TokenItem({
  tab,
  tabName,
  item = {},
  onSendToken,
  handleUnfollow,
  onClickHistory
}) {
  const { wallet } = useWalletContext();
  const [balance, setBalance] = React.useState(null);
  const accountWallet = useAccountWallet();

  React.useEffect(() => {
    loadBalance(item.isInit);
  }, [item.ID, item.history, accountWallet]);

  async function loadBalance(isInit) {
    if (!accountWallet) return;

    if (isInit) {
      setTimeout(async () => {
        try {
          let balance = null;
          if (tabName === "privacy") {
            balance = await accountWallet.getPrivacyCustomTokenBalance(item.ID);
            console.log(
              "accountWallet when get balance privacy custom token: ",
              accountWallet
            );
            console.log("balance privacy custom token: ", balance);
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
          console.log(
            "accountWallet when get balance privacy custom token: ",
            accountWallet
          );
          console.log("balance privacy custom token: ", balance);
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

  const onClickSendMenuItem = () => {
    onSendToken(item, tab);
  };

  const onClickUnfollowMenuItem = () => {
    handleUnfollow(item);
  };

  const onClickHistoryMenuItem = () => {
    onClickHistory(item);
  };

  const { ID, Name } = item;
  let { Image } = item;
  if (!Image || Image === "") {
    let res = await hashToIdenticon([ID]);
    Image = res[0];
  }
  console.log("Image: ", Image);

  const items = [
    { key: 1, onclick: onClickSendMenuItem, text: "Send" },
    { key: 2, onclick: onClickUnfollowMenuItem, text: "Unfollow" },
    { key: 3, onclick: onClickHistoryMenuItem, text: "History" }
  ];

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
      <OptionMenu items={items} />
    </Wrapper>
  );
}

function renderBalance(balance, isInit) {
  if (typeof balance !== "number" || isInit) {
    return <CircularProgress size={20} />;
  }
  return formatTokenAmount(balance);
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
