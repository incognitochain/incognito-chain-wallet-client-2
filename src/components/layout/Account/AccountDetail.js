import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Divider, List, ListItem, Snackbar } from "@material-ui/core";
import { CopyToClipboard } from "react-copy-to-clipboard";
import QRCode from "qrcode.react";
import ConfirmDialog from "../../core/ConfirmDialog";
import Dialog from "../../core/Dialog";
import Account from "../../../services/Account";
import AccountSend from "./Send";
import CreateToken from "../../layout/Token/CreateToken";
import MainTabs from "../../modules/MainTabs";
import {
  Error as IconError,
  CheckCircle as IconSuccess,
  Warning as IconWarning
} from "@material-ui/icons";
import CopyPasteSVG from "../../../assets/images/copy-paste.svg";

import Icon from "../../core/Icon";

import "./Detail.scss";

const styles = theme => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper
  },
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

  componentDidMount() {
    const { account } = this.props;
    this.getData(account);
  }

  componentDidUpdate(prevProps) {
    if (this.props.account !== prevProps.account) {
      this.getData(this.props.account);
    }
  }

  async getData(account) {
    const key = await Account.getPaymentAddress(account.name);
    if (key) {
      const result = await Account.getPrivateKey(key.PaymentAddress);
      if (result) {
        this.setState({
          privateKey: result.PrivateKey,
          paymentAddress: key.PaymentAddress,
          readonlyKey: key.ReadonlyKey
        });
      }
    }

    const result = await Account.getBalance([account.name, 1, "12345678"]);
    if (result.error) {
      this.showError(result.message);
    } else {
      //format mili constant to constant
      this.setState({ balance: Number(result) / 100 });
    }
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
    this.showAlert("Copied!", "info");
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

  showSuccess = msg => {
    this.showAlert(msg, "success");
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
      const result = await Account.removeAccount([
        privateKey,
        account.name,
        "12345678"
      ]);
      if (result) {
        this.onFinish({ message: "Account is removed!" });
      } else if (result.error) {
        this.showError(result.message);
      } else {
        this.showError("Remove error!");
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
      type: tab,
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
        title="Send Token"
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
      <ListItem
        style={{
          textAlign: "center",
          display: "inline-block",
          backgroundColor: "#2D4CF5"
        }}
      >
        <div className="wrapperAccountInfo">
          <div className="wrapperQRCode">
            {paymentAddress && (
              <QRCode
                className="qrCode"
                value={paymentAddress}
                size={164}
                renderAs="svg"
                fgColor="black"
              />
            )}
          </div>
          <div>
            <CopyToClipboard
              text={paymentAddress}
              onCopy={() => this.copyToClipBoard()}
            >
              <div className="paymentInput">
                <input
                  className="form-control"
                  id="paymentAddress"
                  defaultValue={paymentAddress}
                />
                <div className="wrapperIconPaste">
                  <Icon path={CopyPasteSVG} className="CopyPasteSVG" />
                </div>
              </div>
            </CopyToClipboard>
          </div>
          <div className="balance">
            {balance ? Math.round(balance).toLocaleString() : 0} CONSTANT
          </div>
          <div onClick={() => this.openAccountSend(account)}>Send</div>
        </div>
      </ListItem>
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
    const { classes } = this.props;
    const { showAlert } = this.state;

    return (
      <div className={classes.root}>
        {showAlert}
        <List style={{ paddingTop: "0px" }}>
          {this.renderAccountInfo()}
          <Divider />
          {this.renderTabs()}
        </List>
        {this.renderConfirmRemove()}
        {this.renderTokenCreate()}
        {this.renderSendConstant()}
      </div>
    );
  }
}

AccountDetail.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AccountDetail);
