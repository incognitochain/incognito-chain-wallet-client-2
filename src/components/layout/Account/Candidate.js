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
  button: {
    marginTop: theme.spacing.unit * 2,
    height: '3rem',
  },
});

const amountFocus = input => {
  input && input.focus();
};


class AccountCandidate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: props.account,
      paymentAddress: '',
      privateKey: '',
      readonlyKey: '',
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

  showWarning = (msg) => {
    this.showAlert(msg, {flag: 'warning'});
  }

  showSuccess = (msg) => {
    this.showAlert(msg, {flag: 'success', duration: 3000, hideIcon: true});
  }

  showError = (msg) => {
    this.showAlert(msg, {flag: 'danger'});
  }

  confirmRegister = () => { 
    const { amount, balance } = this.state;

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

    if(Number(amount) > Number(balance)){
      this.setState({isAlert: true}, ()=>{
        this.showWarning('Insufficient this account balance!');
      });
      return;
    }

    this.modalConfirmationRef.open();
  }
  
  register = async () => {
    let { amount, privateKey, paymentAddress } = this.state;
    let publicSealerKey = "", result = "";
    
    result = await Account.getPrivateKey(paymentAddress);
    if(result && result.PrivateKey){
      privateKey = result.PrivateKey;
    }

    result = await Account.getSealerKey(privateKey);
    if(result){
      publicSealerKey = result.ProducerPublicKey;
    }

    if(publicSealerKey){
      result = await Account.registerCandidate([privateKey, Number(amount), -1, 1, publicSealerKey ]);
      if(result){
        this.onFinish({message: 'Register is completed!'});
      }
      else{
        this.showError('Register error!');
      }
    }
    //{"jsonrpc":"1.0","method":"sendregistration","params":["112t8rnXFybceEiUtWA9zTLVmaPQFzVmWmN9Day5SJKAhUFm1ew6p1dCyQtNAG8bEFom5q4aGiTBpDVWqmuPgs2iivj5vLmuMeq5nYZZNup7",1,-1,1,"/p2p-circuit/ipfs/QmWccFS3pjoGCdfHgP4t2Y4zWx1CRcPgqbzA7ZintfpFZs"],"id":1}
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
    const { balance, showAlert, amount } = this.state;

    return (
      <div style={{padding: '2rem'}}>
        {showAlert}

        <div className="text-right">
          Balance: { balance ? Math.round(balance).toLocaleString() : 0} CONSTANT
        </div>
        
        <TextField
          required
          id="amount"
          label="Amount"
          className={classes.textField}
          margin="normal"
          variant="outlined"
          value={amount}
          inputRef={amountFocus}
          onChange={(evt) => this.changeAmount(evt)}
        />

        <Button variant="contained" size="large" color="primary" className={classes.button} fullWidth
          onClick={() => this.confirmRegister()} >
            Register
        </Button>
        
        <ConfirmDialog title="Confirmation" onRef={modal => this.modalConfirmationRef = modal} onOK={()=> this.register()}className={{margin: 0}}>
          <div>Are you sure to register with {amount} CONSTANT?</div>
        </ConfirmDialog>
      </div>
    );
  }
}

AccountCandidate.propTypes = {
  classes: PropTypes.object.isRequired,

};

export default withStyles(styles)(AccountCandidate);
