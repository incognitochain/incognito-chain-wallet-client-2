import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Snackbar, TextField, Button } from '@material-ui/core';
import { Warning as IconWarning, Save as IconSave, CheckCircle as IconSuccess, Error as IconError } from '@material-ui/icons';
import Account from '../../../services/Account';
// import { Wallet } from "constant-chain-web-js/build/wallet";
import { connectWalletContext } from "../../../common/context/WalletContext";
import {getPassphrase} from "../../../services/WalletService"
import classNames from 'classnames';
import {connectAppContext} from "../../../common/context/AppContext";

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "100%"
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    height: '3rem',
  },
  button2: {
    marginTop: '1.5rem',
    width: "25%"
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  iconSmall: {
    fontSize: 20,
  },
});

class ImportAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      privateKey: '',
      showAlert: '',
      isAlert: false,
    }
  }

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ showAlert: '', isAlert: false });
  };

  showAlert = (msg, flag='warning') => {
    let showAlert = '', isAlert = true, icon = <IconWarning />;

    if(flag === 'success')
      icon = <IconSuccess />;
    else if(flag === 'danger')
    icon = <IconError />;

    this.setState({isAlert}, ()=> {
      showAlert = <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={isAlert}
        autoHideDuration={3000}
        onClose={this.handleClose}
      >
        <div className={"alert alert-"+flag} role="alert">{icon} {msg}</div>
      </Snackbar>

      this.setState({showAlert});
    });
  }

  showSuccess = (msg) => {
    this.showAlert(msg, 'success');
  }

  showError = (msg) => {
    this.showAlert(msg, 'danger');
  }

  importAccount = async () => {
    const { privateKey, accountName } = this.state;
    if(!accountName){
      this.setState({isAlert: true}, ()=>{
        this.showAlert('Account name is required!');
      });
      return;
    }

    if(!privateKey){
      this.setState({isAlert: true}, ()=>{
        this.showAlert('Private key is required!');
      });
      return;
    }

    const result = await Account.importAccount(privateKey, accountName, getPassphrase(), this.props.wallet);
    if(result){
      this.props.app.listAccounts(this.props.wallet);
      this.onFinish({message:'Account is imported!'});
    }
    else{
      this.showError('Import error!');
    }
  }

  changePrivateKey = (e) => {
    this.setState({privateKey: e.target.value});
  }

  changeAccountName = (e) => {
    this.setState({accountName: e.target.value});
  }

  onFinish = (data) => {
    const { onFinish } = this.props;
    
    if (onFinish) {
      onFinish(data);
    }
  }

  render() {
    const { classes } = this.props;
    const { showAlert } = this.state;

    return (
      <div className="">
        {showAlert}
        <h1 className="mb-2">Import account</h1>
        <div>
          <span className="badge badge-pill badge-light" style={{lineHeight: '1.2rem', whiteSpace: 'unset'}}>
            * Imported accounts will not be associated with 
            your originally created Constant account seedphrase. 
            Learn more about imported accounts <a href="https://constant.money">here</a>
          </span>
        </div>

        <TextField
          required
          id="accountName"
          label="Account Name"
          className={classes.textField}
          margin="normal"
          variant="outlined"
          value={this.state.accountName}
          onChange={(evt) => this.changeAccountName(evt)}
        />

        <TextField
          required
          id="privateKey"
          label="Private Key"
          className={classes.textField}
          margin="normal"
          variant="outlined"
          value={this.state.privateKey}
          onChange={(evt) => this.changePrivateKey(evt)}
        />

        <Button variant="contained" size="large" color="primary" className={classes.button} fullWidth
          onClick={() => this.importAccount()}
        >
          <IconSave className={classNames(classes.leftIcon, classes.iconSmall)} />
          Import Account
        </Button>
        <Button variant="contained" size="small" color="default" className={classes.button2}
          onClick={() => this.onFinish()}
        >
          Back
        </Button>
      </div>
    );
  }
}

ImportAccount.propTypes = {
  classes: PropTypes.object.isRequired,

};

export default withStyles(styles)(connectAppContext(connectWalletContext(ImportAccount)));
