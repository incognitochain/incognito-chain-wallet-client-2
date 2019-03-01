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
import styled from "styled-components";
import { useGetEstimateFee } from "common/hook/useGetEstimateFee";

CreateToken.propTypes = {
  paymentAddress: PropTypes.string.isRequired,
  privateKey: PropTypes.string.isRequired,
  balance: PropTypes.number,
  toAddress: PropTypes.string,
  tokenName: PropTypes.string,
  tokenId: PropTypes.string,
  tokenSymbol: PropTypes.string.isRequired,
  type: PropTypes.number.isRequired,
  isCreate: PropTypes.bool.isRequired,
  onClose: PropTypes.func
};
CreateToken.defaultProps = {
  tokenId: "",
  tokenName: "",
  tokenSymbol: "",
  balance: 0,
  toAddress: ""
};

const refs = { modalConfirmationRef: null }; // TODO - remove this

function reducer(state, action) {
  switch (action.type) {
    case "SET_INPUT":
      return {
        ...state,
        [action.name]: action.value
      };
    case "SUBMIT":
      return {
        ...state,
        submitParams: action.submitParams,
        amount: action.amount
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.error
      };
    case "SET_OPEN_ALERT":
      return {
        ...state,
        alertOpen: state.alertOpen
      };
    case "SET_ESTIMATE_FEE":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

function CreateToken(props) {
  const [state, dispatch] = React.useReducer(reducer, {
    submitParams: [], // TODO - remove this

    alertOpen: false,
    isAlert: false,
    error: null,

    toAddress: props.toAddress || "",
    tokenName: props.tokenName,
    tokenSymbol: props.tokenSymbol,
    amount: "",
    fee: ""
  });
  const amountRef = React.useRef();
  const toAddressRef = React.useRef();

  React.useEffect(() => {
    toAddressRef.current.focus();
  }, []);

  const onChangeInput = name => event => {
    dispatch({
      type: "SET_INPUT",
      name,
      value: event.target.value
    });
  };

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

  const validate = () => {
    const { toAddress, amount, tokenName, tokenSymbol } = state;
    const { balance, isCreate } = props;
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

  const handleSubmit = event => {
    event.preventDefault();

    const { privateKey, isCreate, tokenId, balance } = props;
    const toAddress = event.target.toAddress.value || "";
    const amount = Number(event.target.amount.value);
    const tokenName = event.target.tokenName.value || "";
    const tokenSymbol = event.target.tokenSymbol.value || "";
    const tokenReceiver = {};
    tokenReceiver[toAddress] = amount;
    const objectSend = {
      TokenID: tokenId || "",
      TokenName: tokenName,
      TokenSymbol: tokenSymbol,
      TokenTxType: isCreate ? 0 : 1,
      TokenAmount: amount,
      TokenReceivers: tokenReceiver
    };
    const params = [privateKey, 0, -1, objectSend];
    dispatch({
      type: "SUBMIT",
      submitParams: params,
      amount
    });

    if (validate()) {
      refs.modalConfirmationRef.open();
    } else {
      dispatch({
        type: "SET_ERROR",
        error: isCreate
          ? `Please fill all fields.`
          : `Please fill all fields and amount limit in ${balance} token.`
      });
    }
  };

  const closePage = () => {
    showSuccess();
  };

  const handleAlertOpen = () => {
    dispatch({ type: "SET_OPEN_ALERT", alertOpen: true });
  };

  const handleAlertClose = () => {
    dispatch({ type: "SET_OPEN_ALERT", alertOpen: false });
    props.onClose();
  };

  const renderError = () => {
    const { error } = state;
    if (!error) return null;
    return <div className="errorField">*{error}</div>;
  };

  const renderAlert = () => {
    const { isCreate } = props;
    const title = isCreate ? "Created Token" : "Sent Token";
    const message = isCreate ? "The new token is created" : "The token is sent";
    return (
      <Dialog
        open={state.alertOpen}
        onClose={handleAlertClose}
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
          <Button onClick={handleAlertClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const showSuccess = () => {
    handleAlertOpen();
  };

  const createSendCustomTokenTransaction = async params => {
    const results = await Token.createSendCustomTokenBalance(params);

    const { Error: error } = results;
    if (error) {
      dispatch({
        type: "SET_ERROR",
        error: error
      });
    } else {
      closePage();
    }
  };

  const createSendPrivacyTokenTransaction = async params => {
    const results = await Token.createSendPrivacyCustomTokenTransaction(params);
    const { Error: error } = results;

    if (error) {
      dispatch({
        type: "SET_ERROR",
        error: error
      });
    } else {
      closePage();
    }
  };

  const createOrSendToken = () => {
    const { type } = props;
    const { submitParams } = state;
    if (type === 0) {
      createSendCustomTokenTransaction(submitParams);
    } else {
      createSendPrivacyTokenTransaction(submitParams);
    }
  };

  const renderBalance = () => {
    const { isCreate, balance } = props;
    if (isCreate) return null;
    return (
      <div className="text-right">
        Balance: {balance ? Math.round(balance).toLocaleString() : 0} TOKEN
      </div>
    );
  };

  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit} noValidate>
        {renderBalance()}
        <TextField
          required
          disabled
          id="fromAddress"
          name="fromAddress"
          label="From"
          className="textField"
          margin="normal"
          variant="outlined"
          value={props.paymentAddress}
        />

        <TextField
          required
          id="toAddress"
          name="toAddress"
          label="To"
          className="textField"
          margin="normal"
          variant="outlined"
          value={state.toAddress}
          onChange={onChangeInput("toAddress")}
          inputProps={{ ref: toAddressRef }}
        />

        <div className="wrapperTokenName">
          <TextField
            required
            id="tokenName"
            name="tokenName"
            label="Name"
            className="textField"
            margin="normal"
            variant="outlined"
            value={state.tokenName}
            onChange={onChangeInput("tokenName")}
            disabled={!props.isCreate}
          />
          <TextField
            required
            id="tokenSymbol"
            name="tokenSymbol"
            label="Symbol"
            className="textField"
            margin="normal"
            variant="outlined"
            value={state.tokenSymbol}
            onChange={onChangeInput("tokenSymbol")}
            disabled={!props.isCreate}
          />
        </div>

        <TextField
          inputProps={{ ref: amountRef }}
          required
          id="amount"
          name="amount"
          label="Amount"
          className="textField"
          margin="normal"
          variant="outlined"
          type="number"
          value={state.amount}
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
          value={state.fee}
          onChange={onChangeInput("fee")}
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
      </form>
    );
  };

  const renderConfirmDialog = () => {
    const { amount } = state;
    return (
      <ConfirmDialog
        title="Confirmation"
        onRef={modal => (refs.modalConfirmationRef = modal)}
        onOK={() => createOrSendToken()}
        className={{ margin: 0 }}
      >
        <div>Are you sure to transfer out {amount} TOKEN?</div>
      </ConfirmDialog>
    );
  };

  return (
    <Wrapper>
      {renderForm()}
      {renderError()}
      {renderConfirmDialog()}
      {renderAlert()}
    </Wrapper>
  );
}
export default CreateToken;

const Wrapper = styled.div`
  padding: 20px 20px;

  .textField {
    width: 100%;
  }

  .errorField {
    color: red;
    margin-top: 10px;
  }
`;
