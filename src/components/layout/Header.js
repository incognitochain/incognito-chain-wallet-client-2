import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import {
  AppBar,
  IconButton,
  SwipeableDrawer,
  Toolbar,
  Divider,
  Typography,
  ListItem,
  List,
  Snackbar,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Menu
} from "@material-ui/core";

import {
  ExitToApp as IconExitToApp,
  Home as IconHome,
  Fullscreen as IconFullScreen,
  Settings as IconSettings,
  Info as IconInfo,
  AccountCircle,
  Menu as MenuIcon,
  Error as IconError,
  CheckCircle as IconSuccess,
  Warning as IconWarning
} from "@material-ui/icons";

import { ReactComponent as CreateAccountSVG } from "../../assets/images/create-account.svg";
import { ReactComponent as ImportAccountSVG } from "../../assets/images/import-account.svg";
import "./Header.scss";

import AccountList from "../layout/Account/AccountList";
import styled from "styled-components";
import { connectAppContext } from "../../common/context/AppContext";
import { connectWalletContext } from "../../common/context/WalletContext";
import _ from "lodash";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = {
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  }
};

const SelectedAccount = ({ name, value }) => {
  return (
    <div className="selectedAccount">
      <span className="selectedAccountName">{name}</span> (
      {value === -1 ? (
        <CircularProgress size={20} />
      ) : (
        (Number(value) / 100).toLocaleString({
          maximumFractionDigits: 2
        })
      )}{" "}
      CONST)
    </div>
  );
};

class Header extends React.Component {
  static propTypes = {
    accounts: PropTypes.array.isRequired,
    selectedAccount: PropTypes.object.isRequired,
    onChangeAccount: PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      auth: true,
      anchorEl: null,
      title: props.title,
      left: false,
      showAlert: "",
      isAlert: false
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.anchorEl !== prevState.anchorEl) {
      if (this.state.anchorEl) {
        // menu just open

        this.loadBalances();
      }
    }
  }
  loadBalances = async () => {
    const balances = await Promise.all(
      this.props.wallet.MasterAccount.child.map(async accountWallet => {
        const balance = await accountWallet.getBalance();

        return {
          accountName: accountWallet.name,
          balance
        };
      })
    );

    this.props.app.appDispatch({
      type: "SET_BALANCES",
      balances
    });
  };

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

  showWarning = msg => {
    this.showAlert(msg, { flag: "warning" });
  };

  showError = msg => {
    this.showAlert(msg, { flag: "danger" });
  };

  showInfo = msg => {
    this.showAlert(msg, { flag: "info", duration: 3000, hideIcon: true });
  };

  toggleDrawer = (side, open) => () => {
    this.setState({
      [side]: open
    });
  };

  handleChange = event => {
    this.setState({ auth: event.target.checked });
  };

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  selectMenu = menu => {
    const { callbackSelected } = this.props;

    this.setState({ anchorEl: null }, () => {
      if (callbackSelected) {
        callbackSelected(menu);
      }
    });
  };
  handleChangeAccount = account => {
    this.setState({ anchorEl: null });
    this.props.onChangeAccount(account);
  };

  get sideList() {
    const { classes } = this.props;

    return (
      <div className={classes.list}>
        <List>
          <ListItem button key="home" onClick={() => this.selectMenu("HOME")}>
            <ListItemIcon>
              <IconHome />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem
            button
            key="expandView"
            onClick={() => this.showInfo("Not finish!")}
          >
            <ListItemIcon>
              <IconFullScreen />
            </ListItemIcon>
            <ListItemText primary="Expand View" />
          </ListItem>
          <ListItem
            button
            key="ninjaConstant"
            onClick={() => this.showInfo("Not finish!")}
          >
            <ListItemIcon>
              <IconExitToApp />
            </ListItemIcon>
            <ListItemText primary="View on Constant Explorer" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem
            button
            key="info"
            onClick={() => this.showInfo("Not finish!")}
          >
            <ListItemIcon>
              <IconInfo />
            </ListItemIcon>
            <ListItemText primary="Info & Help" />
          </ListItem>
          <ListItem
            button
            key="settings"
            onClick={() => this.selectMenu("SETTINGS")}
          >
            <ListItemIcon>
              <IconSettings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </div>
    );
  }
  renderAccountList = () => {
    const { accounts } = this.props;
    return (
      <AccountList
        accounts={accounts}
        onChangeAccount={this.handleChangeAccount}
      />
    );
  };
  renderMenu = () => {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);
    return (
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
        open={open}
        onClose={this.handleClose}
      >
        {this.renderAccountList()}
        <MenuItem onClick={() => this.selectMenu("CREATE_ACCOUNT")}>
          <ListItemIcon style={{ marginLeft: "10px" }}>
            <CreateAccountSVG />
          </ListItemIcon>
          Create Account
        </MenuItem>
        <MenuItem onClick={() => this.selectMenu("IMPORT_ACCOUNT")}>
          <ListItemIcon style={{ marginLeft: "10px" }}>
            <ImportAccountSVG />
          </ListItemIcon>
          Import Account
        </MenuItem>
      </Menu>
    );
  };
  render() {
    const { classes, title, selectedAccount } = this.props;
    const { auth, anchorEl, showAlert } = this.state;
    const open = Boolean(anchorEl);

    return (
      <Wrapper>
        {showAlert}
        <StyledAppBar classes={{ root: "AppBar" }} position="static">
          <Toolbar>
            <IconButton
              onClick={this.toggleDrawer("left", true)}
              className={classes.menuButton}
              color="inherit"
              aria-label="Menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.grow}>
              {title}
            </Typography>
            {auth && (
              <div>
                <IconButton
                  aria-owns={open ? "menu-appbar" : undefined}
                  aria-haspopup="true"
                  onClick={this.handleMenu}
                  color="inherit"
                >
                  <SelectedAccount
                    name={selectedAccount.name}
                    value={selectedAccount.value}
                  />
                  <AccountCircle />
                </IconButton>
                {this.renderMenu()}
              </div>
            )}
          </Toolbar>
        </StyledAppBar>
        <SwipeableDrawer
          open={this.state.left}
          onClose={this.toggleDrawer("left", false)}
          onOpen={this.toggleDrawer("left", true)}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={this.toggleDrawer("left", false)}
            onKeyDown={this.toggleDrawer("left", false)}
          >
            {this.sideList}
          </div>
        </SwipeableDrawer>
      </Wrapper>
    );
  }
}

Header.propTypes = {
  classes: PropTypes.object.isRequired
};

export default _.flow([
  withStyles(styles),
  connectAppContext,
  connectWalletContext
])(Header);

const StyledAppBar = styled(AppBar)`
  &.AppBar {
    background-color: #2d4cf5;
  }
`;

const Wrapper = styled.div``;
