import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import './App.css';
import Header from './components/layout/Header';
import Home from './components/pages/Home';
import CreateAccount from './components/pages/Account/Create';
import Settings from './components/pages/Settings';
import ImportAccount from './components/pages/Account/Import';
import Snackbar from '@material-ui/core/Snackbar';
import Server from './services/Server';
import ConfirmDialog from './components/core/ConfirmDialog'

import Account from './services/Account';


import {
  Error as IconError,
  CheckCircle as IconSuccess,
  Warning as IconWarning,
} from '@material-ui/icons';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#6396ef',
      main: '#2469bc',
      dark: '#003f8b',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ffe46e',
      main: '#fdb23c',
      dark: '#c58300',
      contrastText: '#000',
    },
    third: {
      light: '#ff6333',
      main: '#ff3d00',
      dark: '#b22a00',
      contrastText: '#000',
    }
  },
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screen: '',
      headerTitle: 'Wallet home',
      showAlert: '',
      isAlert: false,
      message: '',
      selectedAccount: {},
      accounts: [],
    }

  }

  componentDidMount() {
    const server = Server.getDefault();
    if (!server) {
      Server.setDefault();
      //this.modalServerRef.open();
    }
    this.getAccountList();
  }

  // addServerDefault = () => {
  //   Server.setDefault();
  //   this.selectAccount("");
  // }


  async getAccountList() {
    this.setState({ loading: true, accountList: [] });
    const result = await Account.getAccountList([]);
    if (result) {
      const accounts = result.Accounts, walletName = result.WalletName;
      let accountList = [];

      Object.keys(accounts).forEach(a => {
        accountList.push({ default: false, name: a, value: accounts[a] });
      });
      let selectedAccount = {};
      if (accountList.length > 0){
        accountList[0].default = true;
        selectedAccount = accountList[0];
      }

      this.setState({ walletName, loading: false, selectedAccount, accounts: accountList});
      this.selectAccount("");
    } else {
      setTimeout(() => { this.getAccountList() }, 1000);
    }
  }

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ showAlert: '', isAlert: false });
  };

  
  selectAccount = (action) => {
    const { selectedAccount } = this.state;
    
    let screen = '', headerTitle = 'Home';
    if (action === 'CREATE_ACCOUNT') {
      screen = <CreateAccount onFinish={(data) => { this.backHome(data); }} />;
      headerTitle = 'Account';
    }
    else if (action === 'IMPORT_ACCOUNT') {
      screen = <ImportAccount onFinish={(data) => { this.backHome(data); }} />;
      headerTitle = 'Account';
    }
    else if (action === 'SETTINGS') {
      screen = <Settings onFinish={(data) => { this.backHome(data); }} />;
      headerTitle = 'Settings';
    }
    else {
      //Get Account default
      screen = <Home account={selectedAccount}/>;
    }

    this.setState({ screen, headerTitle });
    
  }


  showAlert = (msg, { flag = 'warning', html = false, duration = 2000, hideIcon = false }) => {
    let showAlert = '', isAlert = true, icon = '';

    if (flag === 'success')
      icon = <IconSuccess />;
    else if (flag === 'danger')
      icon = <IconError />;
    else if (flag === 'warning')
      icon = <IconWarning />;

    this.setState({ isAlert }, () => {
      showAlert = <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={isAlert}
        autoHideDuration={duration}
        onClose={this.handleClose}
      >
        <div className={"alert alert-" + flag} role="alert">{!hideIcon && icon} {msg}</div>
      </Snackbar>

      this.setState({ showAlert });
    });
  }

  showSuccess = (msg) => {
    this.showAlert(msg, { flag: 'success', duration: 3000, hideIcon: true });
  }

  showWarning = (msg) => {
    this.showAlert(msg, { flag: 'warning' });
  }

  showError = (msg) => {
    this.showAlert(msg, { flag: 'danger' });
  }

  backHome = (data) => {
    this.setState({ screen: <Home />, headerTitle: 'Home' });

    if (data && data.message) {
      this.showSuccess(data.message);
    }

  }
  handleChangeAccount = (account) => {
    console.log('Account Change:', account);
    this.setState({ selectedAccount: account }, ()=> {
      this.selectAccount("");
    });
  }

  render() {
    const { screen, headerTitle, showAlert, message, accounts, selectedAccount } = this.state;

    return (
      <div className="App">
        {/* <ConfirmDialog title="PRC Server" onRef={modal => this.modalServerRef = modal} onOK={()=> this.addServerDefault()} className={{margin: 0}}>
          <div>You haven't setup default RPC server. Please do it first!</div>
        </ConfirmDialog> */}

        {showAlert}
        <MuiThemeProvider theme={theme}>
          <Header
            callbackSelected={(action) => { this.selectAccount(action) }}
            title={headerTitle}
            accounts={accounts}
            selectedAccount={selectedAccount}
            onChangeAccount={this.handleChangeAccount}
          />
          <div className="appContainer">
            {screen}
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
