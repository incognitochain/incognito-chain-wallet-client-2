import React from "react";
import { withStyles } from "@material-ui/core/styles";
import ConfirmDialog from "../../core/ConfirmDialog";
import Account from "../../../services/Account";
import { Button, TextField } from "@material-ui/core";
import { useGetEstimateFee } from "common/hook/useGetEstimateFee";
import { useAccountContext, connectAccountContext } from "../../../common/context/AccountContext";
import { useGetBalance } from "./hook/useGetBalance";
import toastr from "toastr";
import { useDebugReducer } from "common/hook/useDebugReducer";
import {connectWalletContext} from "../../../common/context/WalletContext";

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
    case "SET_ESTIMATE_FEE":
      return { ...state, ...action.payload };
    case "RESET":
      return { ...state, amount: 0, toAddress: "" };
    default:
      return state;
  }
}

const refs = { modalConfirmationRef: null }; //TODO - remove this

function AccountSend(props) {
  const amountRef = React.useRef();
  const toAddressRef = React.useRef();

  const account = useAccountContext();

  let [state, dispatch] = useDebugReducer(reducer, account, account => ({
    paymentAddress: account.PaymentAddress,
    toAddress: "",
    amount: "",
    fee: "",
    balance: 0,
    showAlert: "",
    isAlert: false
  }));

  useGetEstimateFee({
    toAddressInput: toAddressRef.current,
    amountInput: amountRef.current,
    toAddress: state.toAddress,
    fee: state.fee,
    EstimateTxSizeInKb: state.EstimateTxSizeInKb,
    GOVFeePerKbTx: state.GOVFeePerKbTx,
    onGotEstimateFee: onGotEstimateFee
  });

  function onGotEstimateFee({
    estimateFee,
    EstimateTxSizeInKb,
    GOVFeePerKbTx
  }) {
    dispatch({
      type: "SET_ESTIMATE_FEE",
      payload: {
        fee: estimateFee,
        EstimateTxSizeInKb,
        GOVFeePerKbTx
      }
    });
  }

  useGetBalance({ dispatch, accountName: account.name });

  const confirmSendCoin = () => {
    const {
      toAddress,
      amount,
      balance,
      fee,
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

    const result = await Account.sendConstant([
      { paymentAddressStr: toAddress, amount : Number(amount) * 100 }
    ], props.account, props.wallet);

    if (result) {
      toastr.success("Completed");
      dispatch({ type: "RESET" });
    } else {
      toastr.error("Send failed. Please try again!");
    }
    //{"jsonrpc":"1.0","method":"sendregistration","params":["112t8rnXFybceEiUtWA9zTLVmaPQFzVmWmN9Day5SJKAhUFm1ew6p1dCyQtNAG8bEFom5q4aGiTBpDVWqmuPgs2iivj5vLmuMeq5nYZZNup7",1,-1,1,"/p2p-circuit/ipfs/QmWccFS3pjoGCdfHgP4t2Y4zWx1CRcPgqbzA7ZintfpFZs"],"id":1}
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
        {props.account.value ? Math.round(props.account.value / 100).toLocaleString() : 0}{" "}
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
        inputProps={{ ref: toAddressRef }}
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
        inputProps={{ ref: amountRef }}
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

export default withStyles(styles)(connectWalletContext(connectAccountContext(AccountSend)));
