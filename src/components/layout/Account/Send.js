import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ConfirmDialog from '../../core/ConfirmDialog'
import Account from '../../../services/Account';
import { Button, Snackbar, TextField} from '@material-ui/core';

import { 
  Error as IconError,
  CheckCircle as IconSuccess,
  Warning as IconWarning,
} from '@material-ui/icons';


const styles = theme => ({
  textField: {
    width: "100%"
  },
  selectField: {
    width: "100%",
    marginBottom: '0.5rem'
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    height: '3rem',
  },
});

const toAddressFocus = input => {
  input && input.focus();
};


class AccountSend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: props.account,
      paymentAddress: '',
      privateKey: '',
      readonlyKey: '',
      toAddress: '',
      amount: '',
      balance: 0,
      showAlert: '',
      isAlert: false,
    }
    
  }

  async componentDidMount(){
    if(this.state.account){
      const key = await Account.getPaymentAddress(this.state.account.name);
      if(key){
        this.setState({privateKey: key.PrivateKey, paymentAddress: key.PaymentAddress, readonlyKey: key.ReadonlyKey})
      }

      const result = await Account.getBalance([this.state.account.name, 1, "12345678"]);
      if (result.error) {
        this.showError(result.message);
      }
      else{
        this.setState({balance: Number(result) / 100});
      }
    }
  }

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ showAlert: '', isAlert: false });
  };

  showAlert = (msg, {flag='warning', html=false, duration=2000, hideIcon=false}) => {
    let showAlert = '', isAlert = true, icon = '';

    if(flag === 'success')
      icon = <IconSuccess />;
    else if(flag === 'danger')
      icon = <IconError />;
      else if(flag === 'warning')
      icon = <IconWarning />;

    this.setState({isAlert}, ()=> {
      showAlert = <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={isAlert}
        autoHideDuration={duration}
        onClose={this.handleClose}
      >
        <div className={"alert alert-"+flag} role="alert">{!hideIcon && icon} {msg}</div>
      </Snackbar>

      this.setState({showAlert});
    });
  }

  showSuccess = (msg) => {
    this.showAlert(msg, {flag: 'success', duration: 3000, hideIcon: true});
  }

  showWarning = (msg) => {
    this.showAlert(msg, {flag: 'warning'});
  }

  showError = (msg) => {
    this.showAlert(msg, {flag: 'danger'});
  }

  confirmSendCoin = () => { 
    const { toAddress, amount, balance } = this.state;
    if(!toAddress){
      this.setState({isAlert: true}, ()=>{
        this.showWarning('To address is required!');
      });
      return;
    }

    if(!amount){
      this.setState({isAlert: true}, ()=>{
        this.showWarning('Amount is required!');
      });
      return;
    }

    if(isNaN(amount)){
      this.setState({isAlert: true}, ()=>{
        this.showWarning('Amount is invalid!');
      });
      return;
    }

    if(Number(amount) <= 0){
      this.setState({isAlert: true}, ()=>{
        this.showWarning('Amount must be greater than zero!');
      });
      return;
    }

    if(Number(amount) > Number(balance)){
      this.setState({isAlert: true}, ()=>{
        this.showWarning('Insufficient this account balance!');
      });
      return;
    }

    this.modalConfirmationRef.open();
  }
  
  sendCoin = async () => {
    let { toAddress, amount, privateKey, paymentAddress } = this.state;

    if(!privateKey){
      const resultKey = await Account.getPrivateKey(paymentAddress);
      if(resultKey && resultKey.PrivateKey){
        privateKey = resultKey.PrivateKey;
        this.setState({privateKey: resultKey.PrivateKey});
      }
    }

    const result = await Account.sendConstant([privateKey, { [toAddress]: Number(amount) * 100 }, -1, 1 ]);console.log(result);
    if(result){
      this.showSuccess(
      <div className="word-break-all">
        <h5 className="text-center">Completed!</h5>
        TxID: {result.TxID}
      </div>);

      this.setState({amount: 0, toAddress: ''});
    }
    else{
      this.showError('Send failed. Please try again!');
    }
    //{"jsonrpc":"1.0","method":"sendregistration","params":["112t8rnXFybceEiUtWA9zTLVmaPQFzVmWmN9Day5SJKAhUFm1ew6p1dCyQtNAG8bEFom5q4aGiTBpDVWqmuPgs2iivj5vLmuMeq5nYZZNup7",1,-1,1,"/p2p-circuit/ipfs/QmWccFS3pjoGCdfHgP4t2Y4zWx1CRcPgqbzA7ZintfpFZs"],"id":1}
  }

  changePaymentAddress = (e) => {
    this.setState({paymentAddress: e.target.value});
  }

  changeToAddress = (e) => {
    this.setState({toAddress: e.target.value});
  }

  changeAmount = (e) => {
    this.setState({amount: e.target.value});
  }

  onFinish = (data) => {
    const { onFinish } = this.props;
    
    if (onFinish) {
      onFinish(data);
    }
  }

  render() {
    const { classes } = this.props;
    const { balance, paymentAddress, showAlert, toAddress, amount } = this.state;

    return (
      <div style={{padding: '2rem'}}>
        {showAlert}
        <TextField
          required
          id="fromAddress"
          label="From"
          className={classes.textField}
          margin="normal"
          variant="outlined"
          value={paymentAddress}
          onChange={(evt) => this.changePaymentAddress(evt)}
        />

        <div className="text-right">
          Balance: { balance ? Math.round(balance).toLocaleString() : 0} CONSTANT
        </div>

        <TextField
          required
          id="toAddress"
          label="To"
          className={classes.textField}
          inputRef={toAddressFocus}
          margin="normal"
          variant="outlined"
          value={toAddress}
          onChange={(evt) => this.changeToAddress(evt)}
        />
        
        <TextField
          required
          id="amount"
          label="Amount"
          className={classes.textField}
          margin="normal"
          variant="outlined"
          value={amount}
          onChange={(evt) => this.changeAmount(evt)}
        />

        <Button variant="contained" size="large" color="primary" className={classes.button} fullWidth
          onClick={() => this.confirmSendCoin()} >
            Send
        </Button>
        <div className="badge badge-pill badge-light mt-3">* Only send CONSTANT to an CONSTANT address.</div>
        <ConfirmDialog title="Confirmation" onRef={modal => this.modalConfirmationRef = modal} onOK={()=> this.sendCoin()}className={{margin: 0}}>
          <div>Are you sure to transfer out {amount} CONSTANT?</div>
        </ConfirmDialog>
      </div>
    );
  }
}

AccountSend.propTypes = {
  classes: PropTypes.object.isRequired,

};

export default withStyles(styles)(AccountSend);
