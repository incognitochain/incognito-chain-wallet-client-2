import React from "react";
import { TextField, Button } from "@material-ui/core";
import ConfirmDialog from "../../core/ConfirmDialog";
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
import { connectAccountContext } from "@common/context/AccountContext";
import { connectWalletContext } from "@common/context/WalletContext";
import _ from "lodash";
import styled from "styled-components";
import * as rpcClientService from "../../../services/RpcClientService";
import $ from "jquery";
import toastr from "toastr";
import CompletedInfo from "@common/components/completedInfo";
import detectBrowser from "@src/services/BrowserDetect";
import QRScanner from "@src/common/components/qrScanner";
import { Loading } from "../../../common/components/loading/Loading";
import Account from "../../../services/Account";

const MaxUint64 = 18446744073709551615;

class CreateToken extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toAddress: props.isCreate
        ? props.account.PaymentAddress
        : props.toAddress || "",
      tokenName: props.tokenName || "",
      tokenSymbol: props.tokenSymbol || "",
      amount: "1",
      fee: "0.5",
      minFee: "",
      balance: -1,

      submitParams: [],
      showCompletedInfo: false,
      isAlert: false,
      error: null,
      txResult: null
    };
  }

  onChangeInput = name => e => {
    if (name === "toAddress") {
      let isValid = Account.checkPaymentAddress(e.target.value);
      console.log("isValid: ", isValid);
      if (!isValid) {
        toastr.warning("Receiver's address is invalid!");
      }
    } else if (name === "amount") {
      if (Number(e.target.value) < 1) {
        toastr.warning("Amount must be at least 1 token!");
      }

      if (Number(e.target.value) > MaxUint64) {
        toastr.warning("Amount must be less than ", MaxUint64);
      }
    } else if (name === "fee") {
      if (Number(e.target.value) < 0.01) {
        toastr.warning("Fee must be at least 0.01 constant!");
      } else {
        if (Number(e.target.value) < this.state.minFee) {
          toastr.warning("Fee must be greater than min fee!");
        }
      }
    }

    if (name === "amount") {
      return this.setState({ [name]: Number.parseInt(e.target.value) });
    }
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
      startWith(this.state.amount)
    );
    const accountWallet = this.props.wallet.getAccountByName(
      this.props.account.name
    );

    this.subscription = combineLatest(toAddressObservable, amountObservable)
      .pipe(
        filter(([toAddress, amount]) => toAddress && amount),
        switchMap(([toAddress, amount]) => {
          if (this.props.balance <= 0) {
            toastr.warning("Balance is zero!");
            return Promise.resolve(0);
          }
          console.log("Estimate feeeeeeeee");
          this.setState({ isLoadingEstimationFee: true });
          return rpcClientService
            .getEstimateFeeForSendingToken(
              this.props.account.PaymentAddress,
              toAddress,
              amount,
              this.getRequestTokenObject(),
              this.props.account.PrivateKey,
              accountWallet
            )
            .catch(e => {
              console.error(e);
              toastr.error("Error on get estimation fee!");
              return Promise.resolve(0);
            });
        })
      )
      .subscribe(fee => {
        this.setState({
          fee: Number(fee) / 100,
          minFee: Number(fee) / 100,
          isLoadingEstimationFee: false
        });
      }, console.error);
  };

  componentWillUnmount() {
    this.current && this.current.unsubscribe();
  }

  validate = ({ toAddress, amount, tokenName, tokenSymbol }) => {
    const { balance, isCreate } = this.props;
    if (!isCreate && amount > balance) return false;
    if (isCreate && amount > MaxUint64) return false;
    if (
      toAddress.length > 0 &&
      amount >= 1 &&
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
          ? `Please fill all fields and amount limit in ${MaxUint64} token`
          : `Please fill all fields and amount limit in ${balance} token.`
      });
    }
  };
  handleCompletedInfoOpen = () => {
    this.setState({ showCompletedInfo: true });
  };

  handleAlertClose = () => {
    this.setState({ showCompletedInfo: false });
    this.props.onClose();
  };
  renderError() {
    const { error } = this.state;
    if (!error) return null;
    return <div className="errorField">*{error}</div>;
  }
  renderCompletedInfo() {
    const { isCreate, tokenSymbol } = this.props;
    const { toAddress, amount, txResult } = this.state;
    const title = isCreate ? "Created Token" : "Sent Token Successfully";
    const trunc = (text = "") => `${text.substr(0, 10)}...${text.substr(-10)}`;
    return (
      <CompletedInfo title={title} onDone={this.handleAlertClose}>
        {isCreate ? (
          <span>The new token is created</span>
        ) : (
          <>
            <span>
              Amount: {Number(amount) || 0} {tokenSymbol}
            </span>
            <span>To: {trunc(toAddress)}</span>
            <span>
              Created at: {new Date(txResult?.lockTime)?.toLocaleString()}
            </span>
          </>
        )}
      </CompletedInfo>
    );
  }
  showSuccess = () => {
    this.handleCompletedInfoOpen();
  };
  createSendCustomTokenTransaction = async (params, fee) => {
    try {
      let response = await Token.createSendCustomToken(
        params,
        Number(fee) * 100,
        this.props.account,
        this.props.wallet
      );
      return response;
    } catch (e) {
      throw e;
    }
  };
  createSendPrivacyTokenTransaction = async (params, fee) => {
    try {
      let response = await Token.createSendPrivacyCustomTokenTransaction(
        params,
        Number(fee) * 100,
        this.props.account,
        this.props.wallet
      );
      return response;
    } catch (e) {
      throw e;
    }
  };

  onQRData = data => this.setState({ toAddress: data });

  createOrSendToken = async () => {
    this.setState({ isLoading: true });
    try {
      // isCreate = true: init token, else: send token
      const { type } = this.props;
      const { submitParams, fee } = this.state;
      //  if type = 0: privacy custom token, else: custom token
      let response;
      if (type === 0) {
        response = await this.createSendPrivacyTokenTransaction(
          submitParams[3],
          fee
        );
      } else {
        response = await this.createSendCustomTokenTransaction(
          submitParams[3],
          fee
        );
      }

      console.log("response send privacy custom token: ", response);

      if (response.err != null) {
        toastr.error(
          (this.props.isCreate ? "Create" : "Send") +
            " Token fail. Please try again later! " +
            (response.err.Message
              ? response.err.Message.toString()
              : response.err.toString())
        );
      } else {
        this.setState({ txResult: response }, this.handleCompletedInfoOpen);
        this.props.onRefreshTokenList();
      }
    } catch (e) {
      console.error(e);
      toastr.error(
        (this.props.isCreate ? "Create" : "Send") +
          " Token fail. Please try again later! " +
          e.toString()
      );
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

        <ToAddressWrapper>
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
            inputProps={{ style: { paddingRight: "110px" } }}
          />
          {!detectBrowser.isChromeExtension && (
            <QRScannerIcon onData={this.onQRData} />
          )}
        </ToAddressWrapper>

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
          pattern="\d*"
          value={this.state.amount}
          onChange={this.onChangeInput("amount")}
        />

        <TextField
          required
          id="fee"
          name="fee"
          label={"Min Fee " + this.state.minFee}
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
            * Loading estimation <b>MIN FEE</b>...
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
    if (this.state.showCompletedInfo) {
      return this.renderCompletedInfo();
    }

    return (
      <Wrapper>
        {this.renderForm()}
        {this.renderError()}
        {this.renderConfirmDialog()}

        {this.state.isLoading && <Loading fullscreen />}
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

const ToAddressWrapper = styled.div`
  position: relative;
`;
const QRScannerIcon = styled(QRScanner)`
  position: absolute;
  right: 20px;
  bottom: 22px;
`;
