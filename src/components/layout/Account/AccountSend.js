import React from "react";
import { withStyles } from "@material-ui/core/styles";
import ConfirmDialog from "../../core/ConfirmDialog";
import Account from "../../../services/Account";
import { Button, TextField, Checkbox } from "@material-ui/core";
import { useAccountContext } from "../../../common/context/AccountContext";
import toastr from "toastr";
import { useWalletContext } from "../../../common/context/WalletContext";
import { useAccountListContext } from "../../../common/context/AccountListContext";
import { fromEvent, combineLatest } from "rxjs";
import {
  map,
  debounceTime,
  switchMap,
  distinctUntilChanged,
  filter,
  startWith
} from "rxjs/operators";
import * as rpcClientService from "../../../services/RpcClientService";
import { useDebugReducer } from "../../../common/hook/useDebugReducer";
import { useAppContext } from "../../../common/context/AppContext";
import { Loading } from "../../../common/components/loading/Loading";
import {
  getAccountBalance,
  saveAccountBalance,
  clearAccountBalance
} from "../../../services/CacheAccountBalanceService";
import QRScanner from "../../../common/components/qrScanner";
import detectBrowser from "@src/services/BrowserDetect";
import CompletedInfo from "../../../common/components/completedInfo";

const styles = theme => ({
  textField: {
    width: "100%"
  },
  selectField: {
    width: "100%",
    marginBottom: "0.5rem"
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    height: "3rem"
  },
  toAddressContent: {
    position: "relative"
  },
  iconQrScanner: {
    position: "absolute",
    right: "20px",
    bottom: "22px"
  }
});

function reducer(state, action) {
  switch (action.type) {
    case "CHANGE_INPUT":
      return { ...state, [action.name]: action.value };
    case "RESET":
      return { ...state, amount: "", toAddress: "", fee: "", minFee: "" };
    case "LOAD_ESTIMATION_FEE":
      return { ...state, isLoadingEstimationFee: true };
    case "LOAD_ESTIMATION_FEE_SUCCESS":
      return {
        ...state,
        isLoadingEstimationFee: false,
        fee: action.fee / 100,
        minFee: action.fee / 100
      };
    case "SHOW_LOADING":
      return { ...state, isLoading: action.isShow };
    default:
      return state;
  }
}

const refs = { modalConfirmationRef: null }; //TODO - remove this

function AccountSend({ classes, isOpen, closeModal }) {
  const amountInputRef = React.useRef();
  const toInputRef = React.useRef();
  const isPrivacyRef = React.useRef();

  const { wallet } = useWalletContext();
  const account = useAccountContext();
  const accounts = useAccountListContext();
  const { appDispatch } = useAppContext();
  const accountWallet = wallet.getAccountByName(account.name);
  const [txResult, setTxResult] = React.useState(null);

  let balance;
  try {
    balance = accounts.find(({ name }) => name === account.name).value;
  } catch (e) {
    console.error(e);
    balance = -1;
  }

  React.useEffect(() => {
    reloadBalance();
  }, []);

  async function reloadBalance() {
    let balance = getAccountBalance(account.name);
    if (balance == -1) {
      balance = await wallet.getAccountByName(account.name).getBalance();
      saveAccountBalance(balance, account.name);
    }
    appDispatch({
      type: "SET_ACCOUNT_BALANCE",
      accountName: account.name,
      balance
    });
  }

  let [state, dispatch] = useDebugReducer(
    "AccountSend",
    reducer,
    account,
    account => ({
      paymentAddress: account.PaymentAddress,
      toAddress: "",
      amount: "0.01",
      fee: "0.00",
      minFee: "0.00",
      showAlert: "",
      isAlert: false,
      isPrivacy: "1"
    })
  );

  React.useEffect(() => {
    const toAddressObservable = fromEvent(toInputRef.current, "keyup").pipe(
      map(e => e.target.value),
      filter(Boolean),
      debounceTime(750),
      distinctUntilChanged(),
      startWith("")
    );

    const amountObservable = fromEvent(amountInputRef.current, "keyup").pipe(
      map(e => Number(e.target.value)),
      filter(Boolean),
      debounceTime(750),
      distinctUntilChanged(),
      startWith(0.01)
    );
    const isPrivacyObservable = fromEvent(isPrivacyRef.current, "change").pipe(
      map(e => e.target.value),
      filter(Boolean),
      debounceTime(750),
      distinctUntilChanged(),
      startWith("")
    );

    const subscription = combineLatest(
      toAddressObservable,
      amountObservable,
      isPrivacyObservable
    )
      .pipe(
        filter(
          ([toAddress, amount, isPrivacy]) =>
            Account.checkPaymentAddress(toAddress) && Number(amount) >= 0.01
        ),
        switchMap(([toAddress, amount, isPrivacy]) => {
          dispatch({ type: "LOAD_ESTIMATION_FEE" });
          console.log(
            "isPrivacy when estimate fee: ",
            isPrivacyRef.current.value
          );
          if (balance <= 0) {
            toastr.warning("Balance is zero!");
            return Promise.resolve(0);
          }
          return rpcClientService
            .getEstimateFee(
              account.PaymentAddress,
              toAddress,
              Number(amount) * 100,
              account.PrivateKey,
              accountWallet,
              Number(isPrivacyRef.current.value)
            )
            .catch(e => {
              console.error(e);
              toastr.error("Error on get estimation fee!");
              return Promise.resolve(0);
            });
        })
      )
      .subscribe(
        fee => {
          dispatch({ type: "LOAD_ESTIMATION_FEE_SUCCESS", fee });
        },
        error => {
          dispatch({ type: "LOAD_ESTIMATION_FEE_ERROR" });
          console.error(error);
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const confirmSendCoin = () => {
    const {
      toAddress,
      amount,
      fee,
      minFee,
      EstimateTxSizeInKb,
      GOVFeePerKbTx
    } = state;

    if (!toAddress) {
      toastr.warning("To address is required!");
      return;
    }

    if (!amount) {
      toastr.warning("Amount is required!");
      return;
    }

    if (isNaN(amount)) {
      toastr.warning("Amount is invalid!");
      return;
    }

    if (Number(amount) < 0.01) {
      toastr.warning("Amount must be at least 0.01 constant!");
      return;
    }

    if (Number(amount) > Number(balance)) {
      toastr.warning("Insufficient this account balance!");
      return;
    }

    if (isNaN(fee)) {
      toastr.warning("Fee is invalid!");
      return;
    }

    if (Number(fee) < 0.01) {
      toastr.warning("Fee must be at least 0.01 constant!");
      return;
    } else {
      if (Number(fee) < minFee) {
        toastr.warning("Fee must be greater than min fee!");
      }
    }

    if (Number(fee) / EstimateTxSizeInKb < GOVFeePerKbTx) {
      toastr.warning(
        `Fee per Tx (Fee/${EstimateTxSizeInKb}) must not lesser then GOV Fee per KbTx (${GOVFeePerKbTx})`
      );
    }

    refs.modalConfirmationRef.open();
  };

  async function sendCoin() {
    dispatch({ type: "SHOW_LOADING", isShow: true });

    // isPrivacy in state is string
    let { toAddress, amount, fee, isPrivacy } = state;

    console.log("isPrivacy when create tx: ", isPrivacy);

    try {
      var result = await Account.sendConstant(
        [{ paymentAddressStr: toAddress, amount: Number(amount) * 100 }],
        Number(fee) * 100,
        Number(isPrivacy),
        account,
        wallet
      );

      if (result.txId) {
        clearAccountBalance(account.name);
        setTxResult(result.txId);
      } else {
        console.log("Create tx err: ", result.err);
        toastr.error(
          "Send failed. Please try again! Err:" + result.err.Message
        );
      }
    } catch (e) {
      console.log("Create tx err: ", e);
      toastr.error("Create and send failed. Please try again! Err:" + e);
    }

    dispatch({ type: "SHOW_LOADING", isShow: false });
  }

  const onChangeInput = name => e => {
    if (name === "isPrivacy") {
      e.target.value = e.target.value == "0" ? "1" : "0";
    }
    dispatch({ type: "CHANGE_INPUT", name, value: e.target.value });
  };

  const onValidator = name => e => {
    if (name === "toAddress") {
      let isValid = Account.checkPaymentAddress(e.target.value);
      if (!isValid) {
        toastr.warning("Receiver's address is invalid!");
      }
    } else if (name === "amount") {
      if (Number(e.target.value) < 0.01) {
        toastr.warning("Amount must be at least 0.01 constant!");
      }
    } else if (name === "fee") {
      if (Number(e.target.value) < 0.01) {
        toastr.warning("Fee must be at least 0.01 constant!");
      } else {
        if (Number(e.target.value) < state.minFee) {
          toastr.warning("Fee must be greater than min fee!");
        }
      }
    }
  };

  const onQRData = data => {
    dispatch({ type: "CHANGE_INPUT", name: "toAddress", value: data });
  };

  if (txResult) {
    const onDone = () => {
      closeModal();
      dispatch({ type: "RESET" });
    };
    const trunc = (text = "") => `${text.substr(0, 10)}...${text.substr(-10)}`;
    return (
      <CompletedInfo title="Sent Successfully" onDone={onDone}>
        <span>Amount: {Number(state?.amount) || 0} CONST</span>
        <span>To: {trunc(state?.toAddress)}</span>
        <span>Tx ID: {trunc(txResult)}</span>
      </CompletedInfo>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      {state.showAlert}
      <TextField
        required
        id="fromAddress"
        label="From"
        className={classes.textField}
        margin="normal"
        variant="outlined"
        value={state.paymentAddress}
        disabled
        onChange={onChangeInput("paymentAddress")}
      />

      <div className="row">
        <div className="col-sm">
          <div>
            <Checkbox
              label="Is Privacy"
              id="isPrivacy"
              checked={state.isPrivacy == "1" ? true : false}
              value={state.isPrivacy}
              onChange={onChangeInput("isPrivacy")}
              color="primary"
              inputProps={{ ref: isPrivacyRef }}
            />
            Is Privacy
          </div>
        </div>
        <div className="col-sm">
          <div className="text-right">
            Balance:{" "}
            {balance
              ? (Number(balance) / 100).toLocaleString(navigator.language, {
                  minimumFractionDigits: 2
                })
              : 0}{" "}
            CONST
          </div>
        </div>
      </div>

      <div className={classes.toAddressContent}>
        <TextField
          required
          id="toAddress"
          label="To"
          className={classes.textField}
          margin="normal"
          variant="outlined"
          value={state.toAddress}
          onChange={e => {
            onChangeInput("toAddress")(e);
          }}
          onBlur={e => onValidator("toAddress")(e)}
          inputProps={{ ref: toInputRef, style: { paddingRight: "50px" } }}
        />
        {!detectBrowser.isChromeExtension && (
          <QRScanner className={classes.iconQrScanner} onData={onQRData} />
        )}
      </div>

      <TextField
        required
        id="amount"
        label="Amount"
        className={classes.textField}
        margin="normal"
        variant="outlined"
        value={state.amount}
        delayTimeout={1000}
        onChange={e => onChangeInput("amount")(e)}
        onBlur={e => onValidator("amount")(e)}
        inputProps={{ ref: amountInputRef }}
      />

      <TextField
        required
        id="fee"
        label={"Min Fee " + state.minFee}
        className={classes.textField}
        margin="normal"
        variant="outlined"
        value={state.fee}
        onChange={onChangeInput("fee")}
        onBlur={e => onValidator("fee")(e)}
      />

      <Button
        variant="contained"
        size="large"
        color="primary"
        className={classes.button}
        fullWidth
        onClick={() => confirmSendCoin()}
      >
        Send
      </Button>
      <div className="badge badge-pill badge-light mt-3">
        * Only send CONSTANT to a CONSTANT address.
      </div>
      {state.isLoadingEstimationFee ? (
        <div className="badge badge-pill badge-light mt-3">
          * Loading estimation <b>MIN FEE</b>...
        </div>
      ) : null}

      <ConfirmDialog
        title="Confirmation"
        onRef={modal => (refs.modalConfirmationRef = modal)}
        onOK={() => sendCoin()}
        className={{ margin: 0 }}
      >
        <div>Are you sure to transfer out {state.amount} CONSTANT?</div>
      </ConfirmDialog>

      <Loading fullscreen isShow={state.isLoading} />
    </div>
  );
}

export default withStyles(styles)(AccountSend);
