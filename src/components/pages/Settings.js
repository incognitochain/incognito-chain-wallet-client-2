import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Dialog from "../core/Dialog";
import ServerList from "../layout/Setting/ServerList";
import ServerAddOrEdit from "../layout/Setting/ServerAddOrEdit";
import Server from "../../services/Server";
import * as walletService from "../../services/WalletService";
import { connectWalletContext } from "../../common/context/WalletContext";

import {
  Tooltip,
  ListSubheader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Snackbar
} from "@material-ui/core";

import {
  Error as IconError,
  CheckCircle as IconSuccess,
  Warning as IconWarning,
  Add as IconAdd,
  Language as IconLanguage,
  Computer as IconServer,
  Ballot as IconPassPhrase
} from "@material-ui/icons";
import { ReactComponent as RefreshIcon } from "../../assets/images/refresh-icon.svg";

const styles = theme => ({
  root: {
    flex: 1,
    backgroundColor: theme.palette.background.paper
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4
  }
});

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalMnemonic: "",
      modalServerList: "",
      modalServerAdd: "",
      accountName: "",
      showAlert: "",
      isAlert: false,
      open: true,
      server: false
    };
  }

  componentDidMount() {
    this.getDefaultServer();
  }

  getDefaultServer() {
    let server = Server.getDefault();
    this.setState({ server });
  }

  handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({ showAlert: "", isAlert: false });
  };

  showAlert = (
    msg,
    { flag = "warning", html = false, duration = 2000, hideIcon = false }
  ) => {
    let showAlert = "",
      isAlert = true,
      icon = "";

    if (flag === "success") icon = <IconSuccess />;
    else if (flag === "danger") icon = <IconError />;
    else if (flag === "warning") icon = <IconWarning />;

    this.setState({ isAlert }, () => {
      showAlert = (
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center"
          }}
          open={isAlert}
          autoHideDuration={duration}
          onClose={this.handleClose}
        >
          <div className={"alert alert-" + flag} role="alert">
            {!hideIcon && icon} {msg}
          </div>
        </Snackbar>
      );

      this.setState({ showAlert });
    });
  };

  showSuccess = msg => {
    this.showAlert(msg, { flag: "success", duration: 3000, hideIcon: true });
  };

  showInfo = msg => {
    this.showAlert(msg, { flag: "info" });
  };

  showWarning = msg => {
    this.showAlert(msg, { flag: "warning" });
  };

  showError = msg => {
    this.showAlert(msg, { flag: "danger" });
  };

  handleClick = () => {
    this.setState(state => ({ open: !state.open }));
  };

  changeAccountName = e => {
    this.setState({ accountName: e.target.value });
  };

  onFinish = data => {
    const { onFinish } = this.props;

    if (onFinish) {
      onFinish(data);
    }
  };

  closeServerAdd = () => {
    this.modalServerAddRef.close();

    this.setState(
      {
        modalAccountDetail: "",
        modalAccountSend: ""
      },
      () => {
        this.openServerList();
      }
    );
  };

  openServerAdd = account => {
    this.modalServerListRef.close();
    this.setState({
      modalServerList: "",
      modalServerAdd: <ServerAddOrEdit onFinish={() => this.closeServerAdd()} />
    });
    this.modalServerAddRef.open();
  };

  get serverButtonAction() {
    const { classes } = this.props;

    return (
      <div>
        <Tooltip title="Add Server">
          <Button
            mini
            color="secondary"
            className={classes.button}
            aria-label="Add Server"
            onClick={() => this.openServerAdd()}
          >
            <IconAdd />
          </Button>
        </Tooltip>
        <Tooltip title="Refresh App">
          <Button
            mini
            color="secondary"
            onClick={() => window.location.reload()}
          >
            <RefreshIcon />
          </Button>
        </Tooltip>
      </div>
    );
  }

  openServerList = () => {
    this.setState({
      modalServerList: <ServerList />
    });
    this.modalServerListRef.open();
  };

  openMnemonic = async () => {
    let mnemonic = await this.showMnemonicWords();
    this.setState({
      modalMnemonic: mnemonic
    });
    this.modalMnemonicRef.open();
  };

  showMnemonicWords = async () => {
    const wallet = await walletService.loadWallet();
    if (wallet) {
      return <div style={{ padding: "20px" }}>{wallet.Mnemonic}</div>;
    } else {
      return <></>;
    }
  };

  render() {
    const { classes } = this.props;
    const {
      showAlert,
      modalServerList,
      modalServerAdd,
      server,
      modalMnemonic
    } = this.state;

    return (
      <div className={classes.root}>
        {showAlert}
        <List
          component="nav"
          subheader={<ListSubheader component="div">Network</ListSubheader>}
        >
          <ListItem button onClick={() => this.openServerList()}>
            <ListItemIcon>
              <IconServer />
            </ListItemIcon>
            <ListItemText
              inset
              primary={
                !server
                  ? "Not found server"
                  : server.name
                  ? server.name
                  : "<Unnamed>"
              }
              secondary={server.address}
            />
          </ListItem>
        </List>
        <List
          component="nav"
          subheader={<ListSubheader component="div">Preferences</ListSubheader>}
        >
          <ListItem button onClick={() => this.showInfo("Coming soon")}>
            <ListItemIcon>
              <IconLanguage />
            </ListItemIcon>
            <ListItemText inset primary="Language" secondary="English" />
          </ListItem>
          {/*<ListItem button onClick={() => this.showInfo("Coming soon")}>
            <ListItemIcon>
              <IconCurrency />
            </ListItemIcon>
            <ListItemText inset primary="Currency" secondary="CONSTANT" />
          </ListItem>*/}
        </List>
        <List
          component="nav"
          subheader={<ListSubheader component="div">Privacy</ListSubheader>}
        >
          {/*<ListItem button onClick={() => this.showInfo("Coming soon")}>
            <ListItemIcon>
              <IconArchive />
            </ListItemIcon>
            <ListItemText
              inset
              primary="State Logs"
              secondary="State logs contain your public account addresses and sent transactions."
            />
          </ListItem>*/}
          <ListItem button onClick={() => this.openMnemonic()}>
            <ListItemIcon>
              <IconPassPhrase />
            </ListItemIcon>
            <ListItemText
              inset
              primary="Seed Phrase"
              secondary="To access your accounts. Save them somewhere safe and secret."
            />
          </ListItem>
        </List>

        <Dialog
          title="RPC Servers"
          onRef={modal => (this.modalServerListRef = modal)}
          onClose={() => this.getDefaultServer()}
          className={{ margin: 0 }}
          buttonAction={this.serverButtonAction}
        >
          {modalServerList}
        </Dialog>

        <Dialog
          title="Add RPC Server"
          onRef={modal => (this.modalServerAddRef = modal)}
          className={{ margin: 0 }}
        >
          {modalServerAdd}
        </Dialog>
        <Dialog
          title="Mnemonic - 12 words"
          onRef={modal => (this.modalMnemonicRef = modal)}
        >
          {modalMnemonic}
        </Dialog>
      </div>
    );
  }
}

Settings.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Settings);
