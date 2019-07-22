import React from "react";
import { withStyles } from "@material-ui/core/styles";
import ConfirmDialog from "@src/components/core/ConfirmDialog";
import Account from "@src/services/Account";
import { Button, TextField, Checkbox } from "@material-ui/core";
import { useAccountContext } from "@src/common/context/AccountContext";
import toastr from "toastr";
import { useWalletContext } from "@src/common/context/WalletContext";
import { useAccountListContext } from "@src/common/context/AccountListContext";
import * as rpcClientService from "@src/services/RpcClientService";
import { useDebugReducer } from "@src/common/hook/useDebugReducer";
import { useAppContext } from "@src/common/context/AppContext";
import { Loading } from "@src/common/components/loading/Loading";
import {
  getAccountBalance,
  saveAccountBalance,
  clearAccountBalance
} from "@src/services/CacheAccountBalanceService";
import QRScanner from "@src/common/components/qrScanner";
import detectBrowser from "@src/services/BrowserDetect";
import SendCoinCompletedInfo from "@src/common/components/completedInfo/sendCoin";
import { formatPRVAmount } from "@src/common/utils/format";
import constants from "../../../../constants";
import { NanoUnit, PrivacyUnit } from "@src/common/utils/constants";

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
    bottom: "21px"
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
        fee: action.fee / PrivacyUnit,
        minFee: action.fee / PrivacyUnit
      };
    case "SHOW_LOADING":
      return { ...state, isLoading: action.isShow };
    default:
      return state;
  }
}

const refs = { modalConfirmationRef: null }; //TODO - remove this

function AccountSend({ classes, isOpen, closeModal, defaultPaymentInfo }) {
  const amountInputRef = React.useRef();
  const toInputRef = React.useRef();

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

  let [state, dispatch] = useDebugReducer(
    "AccountSend",
    reducer,
    account,
    account => ({
      paymentAddress: account.PaymentAddress,
      toAddress: "",
      amount: "1",
      fee: "0.5",
      minFee: "0.00",
      showAlert: "",
      isAlert: false,
      isPrivacy: "1",
      info: ""
    })
  );

  function setDefaultPaymentInfo(defaultPaymentInfo, dispatch) {
    const entries =
      (defaultPaymentInfo && Object.entries(defaultPaymentInfo)) || [];
    entries.forEach(([name, value]) => {
      dispatch({ type: "CHANGE_INPUT", name, value });
    });
  }

  React.useEffect(() => {
    reloadBalance();
    console.log("defaultPaymentInfo: ", defaultPaymentInfo);
    setDefaultPaymentInfo(defaultPaymentInfo, dispatch);
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

  React.useEffect(() => {
    if (
      Account.checkPaymentAddress(state.toAddress) &&
      Number(state.amount) >= Number(NanoUnit)
    ) {
      dispatch({ type: "LOAD_ESTIMATION_FEE" });
      if (balance <= 0) {
        toastr.warning("Get some PRV from the faucet to get started.");
      }
      rpcClientService
        .getEstimateFeeService(
          account.PaymentAddress,
          state.toAddress,
          Number(state.amount) * PrivacyUnit,
          account.PrivateKey,
          accountWallet,
          Number(state.isPrivacy)
        )
        .then(fee => {
          dispatch({ type: "LOAD_ESTIMATION_FEE_SUCCESS", fee });
        })
        .catch(e => {
          dispatch({ type: "LOAD_ESTIMATION_FEE_ERROR" });
          console.log(e);
          toastr.error("Error on get estimation fee!");
        });
    }
  }, [state.toAddress, state.amount, state.isPrivacy]);

  const confirmSendCoin = () => {
    const {
      toAddress,
      amount,
      fee,
      minFee,
      EstimateTxSizeInKb,
      GOVFeePerKbTx,
      info
    } = state;

    if (!toAddress) {
      toastr.warning("Please enter a receiving address.");
      return;
    }

    if (!amount) {
      toastr.warning("Enter an amount");
      return;
    }

    if (isNaN(amount)) {
      toastr.warning("Amount is invalid!");
      return;
    }

    if (Number(amount) < Number(NanoUnit)) {
      toastr.warning("Amount must be at least 0.000000001 PRV!");
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

  async function sendCoin() {
    dispatch({ type: "SHOW_LOADING", isShow: true });

    // isPrivacy in state is string
    let { toAddress, amount, fee, isPrivacy, info } = state;

    console.log("isPrivacy when create tx: ", isPrivacy);

    try {
      var result = await Account.sendConstant(
        [
          { paymentAddressStr: toAddress, amount: Number(amount) * PrivacyUnit }
        ],
        Number(fee) * PrivacyUnit,
        Number(isPrivacy),
        account,
        wallet,
        info
      );
      if (result.txId) {
        clearAccountBalance(account.name);
        setTxResult(result);
      } else {
        console.log("Create tx err: ", result.err);
        toastr.error(
          "Send failed. Please try again! Err:" + result.err.Message
        );
      }
    } catch (e) {
      let msg = e.StackTrace.toString();
      console.log("Create tx err: ", msg.substring(0, 100));
      toastr.error(
        "Create and send failed. Please try again! Err:" +
          msg.substring(0, 100) +
          "..."
      );
    }

    dispatch({ type: "SHOW_LOADING", isShow: false });
  }

  const onChangeInput = name => e => {
    let value = e.target.value;
    if (name === "isPrivacy") {
      value = value === "0" ? "1" : "0";
    }
    dispatch({ type: "CHANGE_INPUT", name, value });
  };

  const onValidator = name => e => {
    if (name === "toAddress") {
      let isValid = Account.checkPaymentAddress(e.target.value);
      if (!isValid) {
        toastr.warning("Receiver's address is invalid!");
      }
    } else if (name === "amount") {
      if (Number(e.target.value) < Number(NanoUnit)) {
        toastr.warning("Amount must be at least 0.000000001 PRV!");
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

  const onQRData = data => {
    dispatch({ type: "CHANGE_INPUT", name: "toAddress", value: data });
  };

  if (txResult) {
    const onClose = () => {
      closeModal();
      dispatch({ type: "RESET" });
    };
    return (
      <SendCoinCompletedInfo
        onClose={onClose}
        amount={state.amount}
        toAddress={state.toAddress}
        txId={txResult?.txId}
        createdAt={txResult?.lockTime * 1000}
        completedInfoProps={{
          isPrivacy: state.isPrivacy === "1"
        }}
      />
    );
  }

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
        value={state.paymentAddress}
        disabled
        onChange={onChangeInput("paymentAddress")}
      />

      <div className="row">
        {/* <div className="col-sm">
          <div>
            <Checkbox
              label="Send privately"
              id="isPrivacy"
              checked={state.isPrivacy === "1" ? true : false}
              value={state.isPrivacy}
              onChange={onChangeInput("isPrivacy")}
              color="primary"
              inputProps={{ ref: isPrivacyRef }}
            />
            Send privately
          </div>
        </div> */}
        <div className="col-sm">
          <div className="text-right">
            Balance: {balance ? formatPRVAmount(balance) : 0}{" "}
            {constants.NATIVE_COIN}
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
          inputProps={{ ref: toInputRef, style: { paddingRight: "110px" } }}
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

      <TextField
        id="info"
        label="Info"
        className={classes.textField}
        margin="normal"
        variant="outlined"
        value={state.info}
        delayTimeout={1000}
        onChange={e => onChangeInput("info")(e)}
        onBlur={e => onValidator("info")(e)}
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
        <div>Are you sure to transfer out {state.amount} PRV?</div>
      </ConfirmDialog>

      {state.isLoading && <Loading fullscreen />}
    </div>
  );
}

export default withStyles(styles)(AccountSend);
