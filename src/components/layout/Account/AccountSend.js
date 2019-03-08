import React from "react";
import { withStyles } from "@material-ui/core/styles";
import ConfirmDialog from "../../core/ConfirmDialog";
import Account from "../../../services/Account";
import { Button, TextField } from "@material-ui/core";
import {
  useAccountContext,
  connectAccountContext
} from "../../../common/context/AccountContext";
import { useGetBalance } from "./hook/useGetBalance";
import toastr from "toastr";
import { connectWalletContext } from "../../../common/context/WalletContext";
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
    case "SET_BALANCE":
      return { ...state, balance: action.balance };
    case "CHANGE_INPUT":
      return { ...state, [action.name]: action.value };
    case "RESET":
      return { ...state, amount: 0, toAddress: "" };
    case "LOAD_ESTIMATION_FEE":
      return { ...state, isLoadingEstimationFee: true };
    case "LOAD_ESTIMATION_FEE_SUCCESS":
      return { ...state, isLoadingEstimationFee: false, fee: action.fee };
    default:
      return state;
  }
}

const refs = { modalConfirmationRef: null }; //TODO - remove this

function AccountSend(props) {
  const amountInputRef = React.useRef();
  const toInputRef = React.useRef();

  const account = useAccountContext();

  let [state, dispatch] = useDebugReducer(
    "AccountSend",
    reducer,
    account,
    account => ({
      paymentAddress: account.PaymentAddress,
      toAddress: "",
      amount: "",
      fee: "",
      balance: 0,
      showAlert: "",
      isAlert: false
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

    const subscription = combineLatest(toAddressObservable, amountObservable)
      .pipe(
        filter(([toAddress, amount]) => toAddress && amount),
        switchMap(([toAddress, amount]) => {
          dispatch({ type: "LOAD_ESTIMATION_FEE" });
          return rpcClientService.getEstimateFee(
            account.PaymentAddress,
            toAddress,
            amount,
            account.PrivateKey
          );
        })
      )
      .subscribe(
        fee => {
          console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", fee);
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

  useGetBalance({ dispatch, accountName: account.name });

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

    if (isNaN(fee)) {
      toastr.warning("Fee is invalid!");
      return;
    }

    if (Number(amount) <= 0) {
      toastr.warning("Amount must be greater than zero!");
      return;
    }

    if (Number(amount) > Number(props.account.value)) {
      toastr.warning("Insufficient this account balance!");
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
    let { toAddress, amount } = state;

    const result = await Account.sendConstant(
      [{ paymentAddressStr: toAddress, amount: Number(amount) * 100 }],
      props.account,
      props.wallet
    );

    if (result) {
      toastr.success("Completed");
      dispatch({ type: "RESET" });
    } else {
      toastr.error("Send failed. Please try again!");
    }
  }

  const onChangeInput = name => e =>
    dispatch({ type: "CHANGE_INPUT", name, value: e.target.value });

  return (
    <div style={{ padding: "2rem" }}>
      {state.showAlert}
      <TextField
        required
        id="fromAddress"
        label="From"
        className={props.classes.textField}
        margin="normal"
        variant="outlined"
        value={state.paymentAddress}
        onChange={onChangeInput("paymentAddress")}
      />

      <div className="text-right">
        Balance:{" "}
        {props.account.value
          ? Math.round(props.account.value / 100).toLocaleString()
          : 0}{" "}
        CONSTANT
      </div>

      <TextField
        required
        id="toAddress"
        label="To"
        className={props.classes.textField}
        margin="normal"
        variant="outlined"
        value={state.toAddress}
        onChange={onChangeInput("toAddress")}
        inputProps={{ ref: toInputRef }}
      />

      <TextField
        required
        id="amount"
        label="Amount"
        className={props.classes.textField}
        margin="normal"
        variant="outlined"
        value={state.amount}
        onChange={e => onChangeInput("amount")(e)}
        inputProps={{ ref: amountInputRef }}
      />

      <TextField
        required
        id="fee"
        label="Fee"
        className={props.classes.textField}
        margin="normal"
        variant="outlined"
        value={state.fee}
        onChange={onChangeInput("fee")}
      />

      <Button
        variant="contained"
        size="large"
        color="primary"
        className={props.classes.button}
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
          * Loading estimation fee...
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
    </div>
  );
}

export default withStyles(styles)(
  connectWalletContext(connectAccountContext(AccountSend))
);
