import React from "react";
import { withStyles } from "@material-ui/core/styles";
import ConfirmDialog from "@src/components/core/ConfirmDialog";
import Account from "@src/services/Account";
import { Button, TextField, Checkbox } from "@material-ui/core";
import { useAccountContext } from "@src/common/context/AccountContext";
import toastr from "toastr";
import { useWalletContext } from "@src/common/context/WalletContext";
import { useAccountListContext } from "@src/common/context/AccountListContext";
import { fromEvent, combineLatest } from "rxjs";
import {
  map,
  debounceTime,
  switchMap,
  distinctUntilChanged,
  filter,
  startWith
} from "rxjs/operators";
import * as rpcClientService from "@src/services/RpcClientService";
import { useDebugReducer } from "@src/common/hook/useDebugReducer";
import { useAppContext } from "@src/common/context/AppContext";
import { Loading } from "@src/common/components/loading/Loading";
import {
  getAccountBalance,
  saveAccountBalance,
  clearAccountBalance
} from "@src/services/CacheAccountBalanceService";
import { formatConstantBalance } from "@src/common/utils/format";
import constants from "../../../../constants";

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

function AccountDefragment({ classes, isOpen }) {
  const amountInputRef = React.useRef();
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
    "AccountDefragment",
    reducer,
    account,
    account => ({
      paymentAddress: account.PaymentAddress,
      amount: "1",
      fee: "",
      minFee: "",
      showAlert: "",
      isAlert: false,
      isPrivacy: "1"
    })
  );

  React.useEffect(() => {
    const amountObservable = fromEvent(amountInputRef.current, "keyup").pipe(
      map(e => Number(e.target.value)),
      filter(Boolean),
      debounceTime(750),
      distinctUntilChanged(),
      startWith("")
    );

    const isPrivacyObservable = fromEvent(isPrivacyRef.current, "change").pipe(
      map(e => e.target.value),
      filter(Boolean),
      debounceTime(750),
      distinctUntilChanged(),
      startWith("")
    );

    const subscription = combineLatest(amountObservable, isPrivacyObservable)
      .pipe(
        filter(([amount]) => true),
        switchMap(([amount]) => {
          if (Number(amountInputRef.current.value) <= 0) {
            return;
          }
          if (balance <= 0) {
            toastr.warning("Get some PRV from the faucet to get started.");
            return Promise.resolve(0);
          }

          dispatch({ type: "LOAD_ESTIMATION_FEE" });
          return rpcClientService
            .getEstimateFeeToDefragmentService(
              account.PaymentAddress,
              Number(amountInputRef.current.value) * 100,
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
          setTimeout(
            () => dispatch({ type: "LOAD_ESTIMATION_FEE_SUCCESS", fee }),
            200
          ); // tricky, make Fee textfield re-render to prevent label overlap
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

  const confirmDefragment = () => {
    const { amount, fee, minFee, EstimateTxSizeInKb, GOVFeePerKbTx } = state;

    if (!amount) {
      toastr.warning("Enter an amount");
      return;
    }

    if (isNaN(amount)) {
      toastr.warning("Amount is invalid!");
      return;
    }

    if (Number(amount) < 0.01) {
      toastr.warning("Amount must be at least 0.01 PRV!");
      return;
    }

    if (Number(amount) > Number(balance)) {
      toastr.warning(
        "Please make sure you have sufficient funds to make this transfer."
      );
      return;
    }

    if (isNaN(fee)) {
      toastr.warning("Fee is invalid!");
      return;
    }

    if (Number(fee) < 0) {
      toastr.warning("Fee must be at least 0 PRV!");
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

  async function defragment() {
    dispatch({ type: "SHOW_LOADING", isShow: true });

    // isPrivacy in state is string
    let { amount, fee, isPrivacy } = state;

    try {
      var result = await Account.defragment(
        Number(amount) * 100,
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
        console.log("Defragment err: ", result.err);
        toastr.error(
          "Defragment failed. Please try again! Err:" + result.err.Message
        );
      }
    } catch (e) {
      console.log("Defragment err: ", e);
      toastr.error("Defragment failed. Please try again! " + e.toString());
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
      console.log("isValid: ", isValid);
      if (!isValid) {
        toastr.warning("Receiver's address is invalid!");
      }
    } else if (name === "amount") {
      if (Number(e.target.value) < 0.01) {
        toastr.warning("Amount must be at least 0.01 PRV!");
      }
    } else if (name === "fee") {
      if (Number(e.target.value) < 0) {
        toastr.warning("Fee must be at least 0 PRV!");
      } else {
        if (Number(e.target.value) < state.minFee) {
          toastr.warning("Fee must be greater than min fee!");
        }
      }
    }
  };

  return (
    <div style={{ padding: "2rem", width: "100%" }}>
      {state.showAlert}
      <TextField
        required
        id="fromAddress"
        label="From"
        className={classes.textField}
        margin="normal"
        variant="outlined"
        disabled
        value={state.paymentAddress}
        onChange={onChangeInput("paymentAddress")}
      />

      <div className="row">
        <div className="col-sm">
          <div>
            <Checkbox
              label="Send privately"
              id="isPrivacy"
              checked={state.isPrivacy == "1" ? true : false}
              value={state.isPrivacy}
              onChange={onChangeInput("isPrivacy")}
              color="primary"
              inputProps={{ ref: isPrivacyRef }}
            />
            Send privately
          </div>
        </div>
        <div className="col-sm">
          <div className="text-right">
            Balance: {balance ? formatConstantBalance(balance) : 0}{" "}
            {constants.NATIVE_COIN}
          </div>
        </div>
      </div>

      {/* <TextField
        required
        id="toAddress"
        label="To"
        className={classes.textField}
        margin="normal"
        variant="outlined"
        value={state.toAddress}
        onChange={e => onChangeInput("toAddress")(e)}
        inputProps={{ ref: toInputRef }}
      /> */}

      <TextField
        required
        id="amount"
        label="<= Amount"
        className={classes.textField}
        margin="normal"
        variant="outlined"
        value={state.amount}
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
        onClick={() => confirmDefragment()}
      >
        Defragment
      </Button>
      {state.isLoadingEstimationFee ? (
        <div className="badge badge-pill badge-light mt-3">
          * Loading estimation <b>MIN FEE</b>...
        </div>
      ) : null}

      <ConfirmDialog
        title="Confirmation"
        onRef={modal => (refs.modalConfirmationRef = modal)}
        onOK={() => defragment()}
        className={{ margin: 0 }}
      >
        <div>Are you sure to defragment wallet?</div>
      </ConfirmDialog>

      {state.isLoading && <Loading fullscreen />}
    </div>
  );
}

export default withStyles(styles)(AccountDefragment);
