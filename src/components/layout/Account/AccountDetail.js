import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Divider, Snackbar, Button, CircularProgress } from "@material-ui/core";
import { CopyToClipboard } from "react-copy-to-clipboard";
import QRCode from "qrcode.react";
import ConfirmDialog from "../../core/ConfirmDialog";
import Dialog from "../../core/Dialog";
import Account from "../../../services/Account";
import AccountSend from "./AccountSend";
import AccountStaking from "./AccountStaking";
import AccountDefragment from "./AccountDefragment";
import CreateToken from "../../layout/Token/CreateToken";
import MainTabs from "../../modules/MainTabs";
import {
  Error as IconError,
  CheckCircle as IconSuccess,
  Warning as IconWarning
} from "@material-ui/icons";
import { ReactComponent as CopyPasteSVG } from "@assets/images/copy-paste.svg";
import toastr from "toastr";
import styled from "styled-components";
import { connectAccountContext } from "../../../common/context/AccountContext";
import { connectWalletContext } from "../../../common/context/WalletContext";
import { connectAccountListContext } from "../../../common/context/AccountListContext";
import * as passwordService from "../../../services/PasswordService";
import _ from "lodash";
import * as cacheAccountListService from "../../../services/CacheListAccountService";
import * as cacheAccountBalanceService from "../../../services/CacheAccountBalanceService";

const styles = theme => ({
  key: {
    backgroundColor: "#fff2df",
    border: "none",
    marginBottom: "1px"
  },
  textField: {
    width: "90%",
    textAlign: "center"
  }
});

const mapTabIndexToType = {
  0: "privacy",
  1: "custom"
};

class AccountDetail extends React.Component {
  static propTypes = {
    account: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      sealerKey: "",
      paymentAddress: "",
      privateKey: "",
      readonlyKey: "",
      showAlert: "",
      balance: 0,
      isAlert: false,
      isExportDumpKey: false,
      modalCreateToken: "",
      modalAccountSend: ""
    };
  }

  onFinish = data => {
    const { onFinish } = this.props;

    if (onFinish) {
      onFinish(data);
    }
  };

  handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({ showAlert: "", isAlert: false });
  };

  copyToClipBoard = () => {
    toastr.success("Copied!");
  };

  showAlert = (msg, flag = "warning") => {
    let showAlert = "",
      isAlert = true,
      icon = <IconWarning />;

    if (flag === "success") icon = <IconSuccess />;
    else if (flag === "danger") icon = <IconError />;
    else icon = "";

    this.setState({ isAlert }, () => {
      showAlert = (
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center"
          }}
          open={isAlert}
          autoHideDuration={2000}
          onClose={this.handleClose}
        >
          <div className={"alert alert-" + flag} role="alert">
            {icon} {msg}
          </div>
        </Snackbar>
      );

      this.setState({ showAlert });
    });
  };

  showError = msg => {
    this.showAlert(msg, "danger");
  };

  removeAccount = async () => {
    const { account } = this.props;
    let privateKey = account.PrivateKey;

    if (privateKey) {
      try {
        await Account.removeAccount(
          privateKey,
          account.name,
          passwordService.getPassphrase(),
          this.props.wallet
        );
      } catch (ex) {
        this.showError("Remove error! " + ex.toString());
        return;
      }
      cacheAccountListService.clearListAccount();
      cacheAccountBalanceService.clearAccountBalance(account.name);
      this.showAlert("Account is removed!", "info");
      window.location.reload();
    } else {
      this.showError("Not found Private Key!");
    }
  };
  onRefreshTokenList = () => {
    if (this.tokenListRef.current) {
      this.tokenListRef.current.onRefresh();
    }
  };
  handleSendToken = (item, tab) => {
    const { paymentAddress, privateKey } = this.state;
    const props = {
      paymentAddress,
      privateKey,
      balance: item.Amount,
      tokenName: item.Name,
      tokenId: item.ID,
      tokenSymbol: item.Symbol,
      type: tab, //@depricated
      tokenType: mapTabIndexToType[tab],
      isCreate: false,
      onClose: this.handleCloseCreateToken
    };
    this.setState({
      isSendToken: true,
      modalCreateToken: (
        <CreateToken {...props} onRefreshTokenList={this.onRefreshTokenList} />
      )
    });
    this.modalTokenCreateRef.open();
  };
  handleCreateToken = tab => {
    const { paymentAddress, privateKey } = this.state;
    const props = {
      paymentAddress,
      privateKey,
      toAddress: paymentAddress,
      type: tab,
      isCreate: true,
      onClose: this.handleCloseCreateToken
    };

    this.setState({
      isSendToken: false,
      modalCreateToken: (
        <CreateToken {...props} onRefreshTokenList={this.onRefreshTokenList} />
      )
    });
    this.modalTokenCreateRef.open();
  };

  handleCloseCreateToken = () => {
    this.modalTokenCreateRef.close();
  };

  handleRemoveAccount = () => {
    this.modalDeleteAccountRef.open();
  };

  renderTokenCreate() {
    const { isSendToken, modalCreateToken } = this.state;
    return (
      <Dialog
        title={(isSendToken ? "Send " : "Create") + " Token"}
        onRef={modal => (this.modalTokenCreateRef = modal)}
        className={{ margin: 0 }}
      >
        {modalCreateToken}
      </Dialog>
    );
  }

  renderConfirmRemove() {
    return (
      <ConfirmDialog
        title="Delete Account"
        onRef={modal => (this.modalDeleteAccountRef = modal)}
        onOK={() => this.removeAccount()}
        className={{ margin: 0 }}
      >
        <div>Are you sure to delete?</div>
      </ConfirmDialog>
    );
  }

  renderSendConstant() {
    const { modalAccountSend } = this.state;
    return (
      <Dialog
        title="Send Coin"
        onRef={modal => (this.modalAccountSendRef = modal)}
        className={{ margin: 0 }}
      >
        {modalAccountSend}
      </Dialog>
    );
  }

  renderStaking() {
    const { modalAccountStaking } = this.state;
    return (
      <Dialog
        title="Staking"
        onRef={modal => (this.modalAccountStakingRef = modal)}
        className={{ margin: 0 }}
      >
        {modalAccountStaking}
      </Dialog>
    );
  }

  renderDefragment() {
    const { modalAccountDefragment } = this.state;
    return (
      <Dialog
        title="Defragment"
        onRef={modal => (this.modalAccountDefragmentRef = modal)}
        className={{ margin: 0 }}
      >
        {modalAccountDefragment}
      </Dialog>
    );
  }

  openAccountSend = account => {
    this.setState({
      modalAccountDetail: "",
      modalAccountSend: <AccountSend />
    });
    this.modalAccountSendRef.open();
  };

  openAccountStaking = account => {
    this.setState({
      modalAccountDetail: "",
      modalAccountStaking: <AccountStaking />
    });
    this.modalAccountStakingRef.open();
  };

  openAccountDefragment = account => {
    this.setState({
      modalAccountDetail: "",
      modalAccountDefragment: <AccountDefragment />
    });
    this.modalAccountDefragmentRef.open();
  };

  getAccountBalance(accountName) {
    try {
      let balance = cacheAccountBalanceService.getAccountBalance(accountName);
      if (balance == -1) {
        return this.props.accountList.find(({ name }) => name === accountName)
          .value;
      }
      return balance;
    } catch (e) {
      console.error(e);
      return -1;
    }
  }

  renderAccountInfo = () => {
    const { account } = this.props;

    const balance = this.getAccountBalance(account.name);

    return (
      <AccountInfoWrapper>
        <QrCodeWrapper>
          {account.PaymentAddress && (
            <QRCode
              className="qrCode"
              value={account.PaymentAddress}
              size={164}
              renderAs="svg"
              fgColor="black"
            />
          )}
        </QrCodeWrapper>
        <CopyToClipboardWrapper>
          <CopyToClipboard
            text={account.PaymentAddress}
            onCopy={() => this.copyToClipBoard()}
          >
            <PaymentInput>
              <input
                readOnly
                className="form-control"
                id="paymentAddress"
                value={
                  account.PaymentAddress.substring(0, 15) +
                  "..." +
                  account.PaymentAddress.substring(90)
                }
              />
              <IconPasteWrapper>
                <CopyPasteSVG />
              </IconPasteWrapper>
            </PaymentInput>
          </CopyToClipboard>
        </CopyToClipboardWrapper>
        <Balance>{this.renderBalance(balance)}</Balance>

        <div className="row" style={{ flexWrap: "nowrap" }}>
          <div className="col-sm">
            <SendButton
              className="SendButton"
              variant="contained"
              onClick={() => this.openAccountSend(account)}
            >
              Send
            </SendButton>
          </div>

          <div className="col-sm">
            <SendButton
              className="SendButton"
              variant="contained"
              onClick={() => this.openAccountStaking(account)}
            >
              Staking
            </SendButton>
          </div>

          <div className="col-sm">
            <SendButton
              className="SendButton"
              variant="contained"
              onClick={() => this.openAccountDefragment(account)}
            >
              Defragment
            </SendButton>
          </div>
        </div>
      </AccountInfoWrapper>
    );
  };

  renderBalance(balance) {
    if (balance === -1) {
      return <CircularProgress size={60} color="secondary" />;
    }
    return (
      <>
        {typeof balance === "number"
          ? (balance / 100).toLocaleString(navigator.language, {
              minimumFractionDigits: 2
            })
          : 0}{" "}
        <span className="constant">CONST</span>
      </>
    );
  }

  tokenListRef = React.createRef();

  renderTabs() {
    const { paymentAddress, readonlyKey } = this.state;
    const props = {
      paymentAddress,
      readonlyKey,
      onSendToken: this.handleSendToken,
      onCreateToken: this.handleCreateToken,
      onRemoveAccount: this.handleRemoveAccount
    };
    return <MainTabs {...props} tokenListRef={this.tokenListRef} />;
  }

  render() {
    const { showAlert } = this.state;

    return (
      <Wrapper className="AccountDetail">
        {showAlert}
        {this.renderAccountInfo()}
        {this.renderTabs()}
        <Divider />
        {this.renderConfirmRemove()}
        {this.renderTokenCreate()}
        {this.renderSendConstant()}
        {this.renderStaking()}
        {this.renderDefragment()}
      </Wrapper>
    );
  }
}

AccountDetail.propTypes = {
  classes: PropTypes.object.isRequired
};

export default _.flow([
  withStyles(styles),
  connectWalletContext,
  connectAccountContext,
  connectAccountListContext
])(AccountDetail);

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: auto;
`;

const AccountInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #2d4cf5;
  padding-bottom: 42px;
`;

const CopyToClipboardWrapper = styled.div`
  align-self: stretch;
  padding-left: 38px;
  padding-right: 38px;
`;

const SendButton = styled(Button)`
  width: 90px;

  &.SendButton {
    background-color: white;
    font-size: 12px;
  }
`;

const Balance = styled.div`
  font-size: 30px;
  font-weight: bold;
  color: white;
  padding-top: 20px;
  padding-bottom: 20px;

  .constant {
    font-size: 20px;
    font-weight: normal;
  }
`;

const QrCodeWrapper = styled.div`
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  width: 118px;
  height: 121px;
  margin-bottom: 22px;

  .qrCode {
    flex: 1;
  }
`;

const PaymentInput = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const IconPasteWrapper = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  background-color: #e6e9ff;
  height: 37px;
  width: 49px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
`;
