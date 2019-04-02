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

function AccountSend({ classes, isOpen }) {
  const amountInputRef = React.useRef();
  const toInputRef = React.useRef();
  const isPrivacyRef = React.useRef();

  const { wallet } = useWalletContext();
  const account = useAccountContext();
  const accounts = useAccountListContext();
  const { appDispatch } = useAppContext();
  const accountWallet = wallet.getAccountByName(account.name);

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
      startWith(0)
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
            toAddress && Number(amount) >= 0.01
        ),
        switchMap(([toAddress, amount, isPrivacy]) => {
          dispatch({ type: "LOAD_ESTIMATION_FEE" });
          console.log(
            "isPrivacy when estimate fee: ",
            isPrivacyRef.current.value
          );
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
              toastr.error("Error on get estimation fee! " + e.toString());
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
    const { toAddress, amount, fee, EstimateTxSizeInKb, GOVFeePerKbTx } = state;

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

    if (Number(amount) <= 0.01) {
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

    if (Number(fee) <= 0.01) {
      toastr.warning("Fee must be at least 0.01 constant!");
      return;
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
        toastr.success("Completed: ", result.txId);
        dispatch({ type: "RESET" });
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
    } else if (name === "isPrivacy") {
      e.target.value = e.target.value == "0" ? "1" : "0";
    }
    dispatch({ type: "CHANGE_INPUT", name, value: e.target.value });
  };

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
        inputProps={{ ref: toInputRef }}
      />

      {/* <DelayInput
        required
        id="amount"
        label="Amount"
        className={classes.textField}
        margin="normal"
        variant="outlined"
        value={state.amount}
        delayTimeout={1000}
        onChange={e => onChangeInput("amount")(e)}
        inputProps={{ ref: amountInputRef }}
      /> */}
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
