import React from "react";
import { TextField, Button, Checkbox } from "@material-ui/core";
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
import { flow } from "lodash";
import styled from "styled-components";
import * as rpcClientService from "../../../services/RpcClientService";
import toastr from "toastr";
import SendTokenCompletedInfo from "@common/components/completedInfo/sendToken";
import CreateTokenCompletedInfo from "@common/components/completedInfo/createToken";
import detectBrowser from "@src/services/BrowserDetect";
import QRScanner from "@src/common/components/qrScanner";
import { Loading } from "../../../common/components/loading/Loading";
import Account from "../../../services/Account";
import { formatTokenAmount } from "@src/common/utils/format";
import { PrivacyUnit } from "@src/common/utils/constants";

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
      feePRV: "1",
      minFeePRV: "1",
      feeToken: "0",
      balance: props.balance,
      isPrivacy: "1",

      submitParams: [],
      showCompletedInfo: false,
      isAlert: false,
      error: null,
      txResult: null
    };
  }

  onChangeInput = name => e => {
    if (name === "amount") {
      return this.setState({ [name]: Number.parseInt(e.target.value) });
    }

    if (name === "isPrivacy") {
      console.log(" e.target.value", e.target.value);
      return this.setState({ [name]: e.target.value === "0" ? "1" : "0" });
    }

    this.setState({ [name]: e.target.value });
    console.log("CreateToken state: ", this.state);
  };

  onValidate = name => e => {
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
      if (Number(e.target.value) < 0) {
        toastr.warning("Fee must be at least 0 PRV!");
      } else {
        if (Number(e.target.value) < this.state.minFee) {
          toastr.warning("Fee must be greater than min fee!");
        }
      }
    }
  };

  toAddressRef = React.createRef();
  amountRef = React.createRef();
  // isPrivacyRef = React.createRef();
  feeTokenRef = React.createRef();

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
    this.toAddressRef?.current?.select();
    this.toAddressRef?.current?.focus();
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

    const feeTokenObservable = fromEvent(
      this.feeTokenRef.current,
      "keyup"
    ).pipe(
      map(e => Number(e.target.value)),
      filter(Boolean),
      debounceTime(750),
      distinctUntilChanged(),
      startWith(this.state.feeToken)
    );

    const accountWallet = this.props.wallet.getAccountByName(
      this.props.account.name
    );

    let isPrivacyTokenObservable = null;

    this.subscription = combineLatest(
      toAddressObservable,
      amountObservable,
      feeTokenObservable
    );
    // if (this.props.type === 0 && !this.props.isCreate) {
    //   isPrivacyTokenObservable = fromEvent(
    //     this.isPrivacyRef.current,
    //     "click"
    //   ).pipe(
    //     map(e => e.target.value),
    //     filter(Boolean),
    //     debounceTime(750),
    //     distinctUntilChanged(),
    //     startWith(this.state.isPrivacy)
    //   );

    //   this.subscription = combineLatest(
    //     toAddressObservable,
    //     amountObservable,
    //     feeTokenObservable,
    //     isPrivacyTokenObservable
    //   );
    // } else {
    //   this.subscription = combineLatest(
    //     toAddressObservable,
    //     amountObservable,
    //     feeTokenObservable
    //   );
    // }

    this.subscription
      .pipe(
        filter(([toAddress, amount, feeToken]) => toAddress && amount),
        switchMap(([toAddress, amount, feeToken]) => {
          console.log("Estimate feeeeeeeee");
          this.setState({ isLoadingEstimationFee: true });
          let isPrivacyForPrivateToken = false;

          if (this.props.type === 0) {
            isPrivacyForPrivateToken = this.state.isPrivacy === "1";
            console.log("isPrivacyForPrivateToken: ", isPrivacyForPrivateToken);
          }
          // test: get token fee
          // return rpcClientService
          //   .getEstimateTokenFeeService(
          //     this.props.account.PaymentAddress,
          //     toAddress,
          //     amount,
          //     this.getRequestTokenObject(),
          //     this.props.account.PrivateKey,
          //     accountWallet,
          //     isPrivacyForPrivateToken
          //   )
          //   .catch(e => {
          //     console.error(e);
          //     toastr.error("Error on get estimation fee!");
          //     return Promise.resolve(0);
          //   });

          // test: get max withdraw token
          // return rpcClientService
          // .getMaxWithdrawAmountService(
          //   this.props.account.PaymentAddress,
          //   toAddress,
          //   this.getRequestTokenObject(),
          //   this.props.account.PrivateKey,
          //   accountWallet,
          //   isPrivacyForPrivateToken
          // )
          // .catch(e => {
          //   console.error(e);
          //   toastr.error("Error on get estimation fee!");
          //   return Promise.resolve(0);
          // });

          return rpcClientService
            .getEstimateFeeForSendingTokenService(
              this.props.account.PaymentAddress,
              toAddress,
              amount,
              this.getRequestTokenObject(),
              this.props.account.PrivateKey,
              accountWallet,
              isPrivacyForPrivateToken,
              this.state.feeToken
            )
            .catch(e => {
              console.error(e);
              toastr.error("Error on get estimation fee!");
              return Promise.resolve(0);
            });
        })
      )
      .subscribe(fee => {
        console.log("Fee AAAAA: ", fee);
        this.setState({
          feePRV: Number(fee) / PrivacyUnit,
          minFeePRV: Number(fee) / PrivacyUnit,
          isLoadingEstimationFee: false
        });
      }, console.error);
  };

  componentWillUnmount() {
    this.current && this.current.unsubscribe();
  }

  validate = ({ toAddress, amount, tokenName, tokenSymbol }) => {
    const { isCreate } = this.props;
    const { balance } = this.state;
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
    const { privateKey, isCreate } = this.props;
    const { balance } = this.state;
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
    if (isCreate) {
      return <CreateTokenCompletedInfo />;
    }
    return (
      <SendTokenCompletedInfo
        tokenSymbol={tokenSymbol}
        amount={amount}
        toAddress={toAddress}
        txId={txResult?.txId}
        createdAt={txResult?.lockTime * 1000}
      />
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
  createSendPrivacyTokenTransaction = async (
    params,
    feePRV,
    feeToken,
    isPrivacy
  ) => {
    try {
      let response = await Token.createSendPrivacyCustomTokenTransaction(
        params,
        Number(feePRV) * PrivacyUnit,
        Number(feeToken),
        isPrivacy,
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
      const { submitParams, feePRV, feeToken, isPrivacy } = this.state;
      const isPrivacyForToken = isPrivacy === "1";
      //  if type = 0: privacy custom token, else: custom token
      let response;
      if (type === 0) {
        response = await this.createSendPrivacyTokenTransaction(
          submitParams[3],
          feePRV,
          feeToken,
          isPrivacyForToken
        );
      } else {
        response = await this.createSendCustomTokenTransaction(
          submitParams[3],
          feePRV
        );
      }

      console.log("response send token: ", response);

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
          onBlur={this.onValidate("tokenName")}
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
          onBlur={this.onValidate("tokenSymbol")}
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
        Balance: {balance > 0 ? formatTokenAmount(balance) : balance} TOKEN
      </div>
    );
  }

  renderIsPrivacyCheckbox() {
    const { type, isCreate } = this.props;

    if (type === 0 && !isCreate) {
      return (
        <div className="row">
          <div className="col-sm">
            <div>
              <Checkbox
                label="Send privately"
                id="isPrivacy"
                name="isPrivacy"
                checked={this.state.isPrivacy === "1" ? true : false}
                value={this.state.isPrivacy}
                onChange={this.onChangeInput("isPrivacy")}
                color="primary"
                inputRef={this.isPrivacyRef}
              />
              Send privately
            </div>
          </div>
        </div>
      );
    }

    return null;
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

        {/* {this.renderIsPrivacyCheckbox()} */}

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
            onBlur={this.onValidate("toAddress")}
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
          onBlur={this.onValidate("amount")}
        />

        <TextField
          required
          id="feeToken"
          name="feeToken"
          label="Fee Token"
          className="textField"
          margin="normal"
          variant="outlined"
          type="number"
          value={this.state.feeToken}
          onChange={this.onChangeInput("feeToken")}
          onBlur={this.onValidate("feeToken")}
          inputRef={this.feeTokenRef}
        />

        <TextField
          required
          id="feePRV"
          name="feePRV"
          label={"Min Fee " + this.state.minFeePRV}
          className="textField"
          margin="normal"
          variant="outlined"
          type="number"
          value={this.state.feePRV}
          onChange={this.onChangeInput("feePRV")}
          onBlur={this.onValidate("feePRV")}
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
export default flow([connectWalletContext, connectAccountContext])(CreateToken);

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
