import React from "react";
import PropTypes from "prop-types";
import { TextField, Button } from "@material-ui/core";
import ConfirmDialog from "../../core/ConfirmDialog";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import Token from "../../../services/Token";

import { fromEvent, combineLatest } from "rxjs";
import {
  map,
  debounceTime,
  switchMap,
  distinctUntilChanged,
  filter,
  startWith
} from "rxjs/operators";
import { connectAccountContext } from "common/context/AccountContext";
import { connectWalletContext } from "common/context/WalletContext";
import _ from "lodash";
import styled from "styled-components";
import * as rpcClientService from "../../../services/RpcClientService";
import $ from "jquery";
import toastr from "toastr";
import { Loading } from "../../../common/components/loading/Loading";

class CreateToken extends React.Component {
  static propTypes = {
    balance: PropTypes.number,
    toAddress: PropTypes.string,
    tokenName: PropTypes.string,
    tokenId: PropTypes.string,
    tokenSymbol: PropTypes.string.isRequired,
    type: PropTypes.number.isRequired,
    isCreate: PropTypes.bool.isRequired,
    onClose: PropTypes.func
  };
  static defaultProps = {
    tokenId: "",
    tokenName: "",
    tokenSymbol: "",
    balance: 0,
    toAddress: ""
  };

  constructor(props) {
    super(props);
    this.state = {
      toAddress: props.isCreate
        ? props.account.PaymentAddress
        : props.toAddress || "",
      tokenName: props.tokenName || "",
      tokenSymbol: props.tokenSymbol || "",
      amount: "",
      fee: "",
      balance: -1,

      submitParams: [],
      alertOpen: false,
      isAlert: false,
      error: null
    };
  }

  onChangeInput = name => e => {
    this.setState({ [name]: e.target.value });
  };

  toAddressRef = React.createRef();
  amountRef = React.createRef();

  componentDidMount() {
    this.autoFocus();
    this.getEstimateFee();
    if (!this.props.isCreate) {
      this.reloadBalance();
    }
  }

  reloadBalance = async () => {
    const accountWallet = this.props.wallet.getAccountByName(
      this.props.account.name
    );
    if (this.props.tokenType === "privacy") {
      const balance = await accountWallet.getPrivacyCustomTokenBalance(
        this.props.tokenId
      );
      this.setState({ balance });
    } else {
      const balance = await accountWallet.getCustomTokenBalance(
        this.props.tokenId
      );
      this.setState({ balance });
    }
  };

  autoFocus = () => {
    $(this.toAddressRef.current).focus(function() {
      $(this).select();
    });
    this.toAddressRef.current.focus();
  };

  getEstimateFee = () => {
    const toAddressObservable = fromEvent(
      this.toAddressRef.current,
      "keyup"
    ).pipe(
      map(e => e.target.value),
      filter(Boolean),
      debounceTime(750),
      distinctUntilChanged(),
      startWith(this.state.toAddress)
    );

    const amountObservable = fromEvent(this.amountRef.current, "keyup").pipe(
      map(e => Number(e.target.value)),
      filter(Boolean),
      debounceTime(750),
      distinctUntilChanged(),
      startWith(0)
    );

    this.subscription = combineLatest(toAddressObservable, amountObservable)
      .pipe(
        filter(([toAddress, amount]) => toAddress && amount),
        switchMap(([toAddress, amount]) => {
          this.setState({ isLoadingEstimationFee: true });
          return rpcClientService
            .getEstimateFeeForSendingToken(
              this.props.account.PaymentAddress,
              toAddress,
              amount,
              this.getRequestTokenObject(),
              this.props.account.PrivateKey
            )
            .catch(e => {
              console.error(e);
              toastr.error("Error on get estimation fee!");
              return Promise.resolve(0);
            });
        })
      )
      .subscribe(fee => {
        this.setState({ fee, isLoadingEstimationFee: false });
      }, console.error);
  };

  componentWillUnmount() {
    this.current && this.current.unsubscribe();
  }

  validate = ({ toAddress, amount, tokenName, tokenSymbol }) => {
    const { balance, isCreate } = this.props;
    if (!isCreate && amount > balance) return false;
    if (
      toAddress.length > 0 &&
      amount > 0 &&
      tokenName.length > 0 &&
      tokenSymbol.length > 0
    )
      return true;
    return false;
  };

  getRequestTokenObject = () => {
    const amount = Number(this.state.amount);

    return {
      Privacy: this.props.type === 0,
      TokenID: this.props.tokenId || "",
      TokenName: this.state.tokenName,
      TokenSymbol: this.state.tokenSymbol,
      TokenTxType: this.props.isCreate ? 0 : 1,
      TokenAmount: amount,
      TokenReceivers: {
        PaymentAddress: this.state.toAddress,
        Amount: amount
      }
    };
  };
  handleSubmit = event => {
    event.preventDefault();
    const { privateKey, isCreate, balance } = this.props;
    const toAddress = event.target.toAddress.value || "";
    const amount = Number(event.target.amount.value);
    const tokenName = event.target.tokenName.value || "";
    const tokenSymbol = event.target.tokenSymbol.value || "";

    const objectSend = this.getRequestTokenObject();
    const params = [privateKey, 0, -1, objectSend];
    this.setState({
      submitParams: params,
      amount
    });

    if (this.validate({ toAddress, amount, tokenName, tokenSymbol })) {
      this.modalConfirmationRef.open();
    } else {
      this.setState({
        error: isCreate
          ? `Please fill all fields.`
          : `Please fill all fields and amount limit in ${balance} token.`
      });
    }
  };
  closePage = () => {
    this.showSuccess();
  };
  handleAlertOpen = () => {
    this.setState({ alertOpen: true });
  };

  handleAlertClose = () => {
    this.setState({ alertOpen: false });
    this.props.onClose();
  };
  renderError() {
    const { error } = this.state;
    if (!error) return null;
    return <div className="errorField">*{error}</div>;
  }
  renderAlert() {
    const { isCreate } = this.props;
    const title = isCreate ? "Created Token" : "Sent Token";
    const message = isCreate ? "The new token is created" : "The token is sent";
    return (
      <Dialog
        open={this.state.alertOpen}
        onClose={this.handleAlertClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleAlertClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  showSuccess = () => {
    this.handleAlertOpen();
  };
  createSendCustomTokenTransaction = async params => {
    try {
      await Token.createSendCustomToken(
        params,
        this.props.account,
        this.props.wallet
      );
    } catch (e) {
      console.error(e);
      toastr.error("Error on createSendCustomTokenTransaction()");
    }
  };
  createSendPrivacyTokenTransaction = async params => {
    try {
      await Token.createSendPrivacyCustomTokenTransaction(
        params,
        this.props.account,
        this.props.wallet
      );
    } catch (e) {
      console.error(e);
      toastr.error("Error on createSendPrivacyCustomTokenTransaction()");
    }
  };

  createOrSendToken = async () => {
    this.setState({ isLoading: true });
    try {
      // isCreate = true: init token, else: send token
      const { type } = this.props;
      const { submitParams } = this.state;

      console.log("Submit param when create or send token: ", submitParams[3]);

      //  if type = 0: privacy custom token, else: custom token
      if (type === 0) {
        await this.createSendPrivacyTokenTransaction(submitParams[3]);
      } else {
        await this.createSendCustomTokenTransaction(submitParams[3]);
      }
      this.props.onRefreshTokenList();
      this.closePage();
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({ isLoading: false });
    }
  };
  renderTokenName() {
    const { isCreate, tokenName, tokenSymbol } = this.props;
    return (
      <div className="wrapperTokenName">
        <TextField
          required
          id="tokenName"
          name="tokenName"
          label="Name"
          className="textField"
          margin="normal"
          variant="outlined"
          defaultValue={tokenName || ""}
          onChange={this.onChangeInput("tokenName")}
          disabled={isCreate ? false : true}
        />
        <TextField
          required
          id="tokenSymbol"
          name="tokenSymbol"
          label="Symbol"
          className="textField"
          margin="normal"
          variant="outlined"
          defaultValue={tokenSymbol || ""}
          onChange={this.onChangeInput("tokenSymbol")}
          disabled={isCreate ? false : true}
        />
      </div>
    );
  }
  renderBalance() {
    const { isCreate } = this.props;
    const { balance } = this.state;
    if (isCreate) return null;
    return (
      <div className="text-right">
        Balance: {balance > 0 ? Math.round(balance).toLocaleString() : balance}{" "}
        TOKEN
      </div>
    );
  }
  renderForm() {
    return (
      <form onSubmit={this.handleSubmit}>
        {this.renderBalance()}
        <TextField
          required
          disabled
          id="fromAddress"
          name="fromAddress"
          label="From"
          className="textField"
          margin="normal"
          variant="outlined"
          value={this.props.account.PaymentAddress}
        />

        <TextField
          required
          id="toAddress"
          name="toAddress"
          label="To"
          className="textField"
          inputRef={this.toAddressRef}
          margin="normal"
          variant="outlined"
          value={this.state.toAddress}
          onChange={this.onChangeInput("toAddress")}
        />

        {this.renderTokenName()}
        <TextField
          required
          inputRef={this.amountRef}
          id="amount"
          name="amount"
          label="Amount"
          className="textField"
          margin="normal"
          variant="outlined"
          type="number"
          value={this.state.amount}
          onChange={this.onChangeInput("amount")}
        />

        <TextField
          required
          id="fee"
          name="fee"
          label="Fee"
          className="textField"
          margin="normal"
          variant="outlined"
          type="number"
          value={this.state.fee}
          onChange={this.onChangeInput("fee")}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          color="primary"
          className="button"
          fullWidth
        >
          Send
        </Button>
        {this.state.isLoadingEstimationFee ? (
          <div className="badge badge-pill badge-light mt-3">
            * Loading estimation fee...
          </div>
        ) : null}
      </form>
    );
  }
  renderConfirmDialog() {
    const { amount } = this.state;
    return (
      <ConfirmDialog
        title="Confirmation"
        onRef={modal => (this.modalConfirmationRef = modal)}
        onOK={() => this.createOrSendToken()}
        className={{ margin: 0 }}
      >
        <div>Are you sure to transfer out {amount} TOKEN?</div>
      </ConfirmDialog>
    );
  }
  render() {
    return (
      <Wrapper>
        {this.renderForm()}
        {this.renderError()}
        {this.renderConfirmDialog()}
        {this.renderAlert()}

        <Loading fullscreen isShow={this.state.isLoading} />
      </Wrapper>
    );
  }
}
export default _.flow([connectWalletContext, connectAccountContext])(
  CreateToken
);

const Wrapper = styled.div`
  padding: 20px 20px;

  .textField {
    width: 100%;
    );
   }

  .errorField {
    color: red;
    margin-top: 10px;
  }
`;
