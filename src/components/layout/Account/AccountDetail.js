import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Divider, Snackbar, Button } from "@material-ui/core";
import { CopyToClipboard } from "react-copy-to-clipboard";
import QRCode from "qrcode.react";
import ConfirmDialog from "../../core/ConfirmDialog";
import Dialog from "../../core/Dialog";
import Account from "../../../services/Account";
import AccountSend from "./AccountSend";
import CreateToken from "../../layout/Token/CreateToken";
import MainTabs from "../../modules/MainTabs";
import {
  Error as IconError,
  CheckCircle as IconSuccess,
  Warning as IconWarning
} from "@material-ui/icons";
import { ReactComponent as CopyPasteSVG } from "assets/images/copy-paste.svg";
import toastr from "toastr";
import styled from "styled-components";
import { connectAccountContext } from "../../../common/context/AccountContext";
import {connectWalletContext} from "../../../common/context/WalletContext";

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

  // componentDidMount() {
  //   const { account } = this.props;
  //   this.getData(account);
  // }

  // componentDidUpdate(prevProps) {
  //   if (this.props.account !== prevProps.account) {
  //     this.getData(this.props.account);
  //   }
  // }

  // async getData(account) {
  //   // TODO - use AccountContext instead
  //   const key = await Account.getPaymentAddress(account.name);
  //   if (key) {
  //     const result = await Account.getPrivateKey(key.PaymentAddress);
  //     if (result) {
  //       this.setState({
  //         privateKey: result.PrivateKey,
  //         paymentAddress: key.PaymentAddress,
  //         readonlyKey: key.ReadonlyKey
  //       });
  //     }
  //   }
  //
  //   const result = await Account.getBalance([account.name, 1, "12345678"]);
  //   if (result.error) {
  //     this.showError(result.message);
  //   } else {
  //     //format mili constant to constant
  //     this.setState({ balance: Number(result) / 100 });
  //   }
  // }

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
    let { privateKey, paymentAddress } = this.state;
    const { account } = this.props;
    if (!privateKey) {
      const result = await Account.getPrivateKey(paymentAddress);
      if (result && result.PrivateKey) {
        privateKey = result.PrivateKey;
      }
    }

    if (privateKey) {
      try{
        let result = await Account.removeAccount(privateKey, account.name, "12345678", this.props.wallet);
        if (result){
          this.onFinish({ message: "Account is removed!" });
        } else {
          this.showError("Remove error!");
        }
      }catch (e) {
        throw e
      }
    } else {
      this.showError("Not found Private Key!");
    }
  };

  handleSendToken = (item, tab) => {
    const { paymentAddress, privateKey } = this.state;
    const props = {
      paymentAddress,
      privateKey,
      balance: item.Amount,
      tokenName: item.Name,
      tokenId: item.TokenID,
      tokenSymbol: item.Symbol,
      type: tab, //@depricated
      tokenType: mapTabIndexToType[tab],
      isCreate: false,
      onClose: this.handleCloseCreateToken
    };
    this.setState({
      modalCreateToken: <CreateToken {...props} />
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
    console.log(props);
    this.setState({
      modalCreateToken: <CreateToken {...props} />
    });
    this.modalTokenCreateRef.open();
  };
  handleCloseCreateToken = () => {
    this.modalTokenCreateRef.close();
    this.tokenTabsRef.onRefresh();
  };
  handleRemoveAccount = () => {
    this.modalDeleteAccountRef.open();
  };

  renderTokenCreate() {
    const { modalCreateToken } = this.state;
    return (
      <Dialog
        title="Create Token"
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

  openAccountSend = account => {
    // this.modalAccountDetailRef.close();
    this.setState({
      modalAccountDetail: "",
      modalAccountSend: <AccountSend account={this.props.account} />
    });
    this.modalAccountSendRef.open();
  };

  renderAccountInfo = () => {
    const { paymentAddress, balance } = this.state;
    const { account } = this.props;

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
                className="form-control"
                id="paymentAddress"
                defaultValue={account.PaymentAddress}
              />
              <IconPasteWrapper>
                <CopyPasteSVG />
              </IconPasteWrapper>
            </PaymentInput>
          </CopyToClipboard>
        </CopyToClipboardWrapper>
        <Balance>
          {account.value ? Math.round(account.value / 100).toLocaleString() : 0}{" "}
          <span className="constant">Constant</span>
        </Balance>

        <SendButton
          className="SendButton"
          variant="contained"
          onClick={() => this.openAccountSend(account)}
        >
          Send
        </SendButton>
      </AccountInfoWrapper>
    );
  };

  renderTabs() {
    const { paymentAddress, readonlyKey } = this.state;
    const props = {
      paymentAddress,
      readonlyKey,
      onSendToken: this.handleSendToken,
      onCreateToken: this.handleCreateToken,
      onRemoveAccount: this.handleRemoveAccount
    };
    return <MainTabs {...props} />;
  }

  render() {
    const { showAlert } = this.state;

    return (
      <Wrapper>
        {showAlert}
        {this.renderAccountInfo()}
        {this.renderTabs()}
        <Divider />
        {this.renderConfirmRemove()}
        {this.renderTokenCreate()}
        {this.renderSendConstant()}
      </Wrapper>
    );
  }
}

AccountDetail.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(connectWalletContext(connectAccountContext(AccountDetail)));

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
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
