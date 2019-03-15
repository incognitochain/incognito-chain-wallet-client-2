import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Snackbar, TextField, Button } from "@material-ui/core";
import {
  Warning as IconWarning,
  Save as IconSave,
  CheckCircle as IconSuccess,
  Error as IconError
} from "@material-ui/icons";
import Account from "../../../services/Account";
import { connectWalletContext } from "../../../common/context/WalletContext";
import { connectAppContext } from "../../../common/context/AppContext";
import { connectAccountListContext } from "../../../common/context/AccountListContext";

import classNames from "classnames";

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "100%"
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    height: "3rem"
  },
  button2: {
    marginTop: "1.5rem",
    width: "25%"
  },
  iconSmall: {
    fontSize: 20
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  }
});

class CreateAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accountName: "",
      showAlert: "",
      isAlert: false
    };
  }

  handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({ showAlert: "", isAlert: false });
  };

  showAlert = (msg, flag = "warning") => {
    let showAlert = "",
      isAlert = true,
      icon = <IconWarning />;

    if (flag === "success") icon = <IconSuccess />;
    else if (flag === "danger") icon = <IconError />;

    this.setState({ isAlert }, () => {
      showAlert = (
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center"
          }}
          open={isAlert}
          autoHideDuration={3000}
          onClose={this.handleClose}
        >
          <div className={"alert alert-" + flag} role="alert">
            {icon} {msg}
          </div>
        </Snackbar>
      );

      this.setState({ showAlert });
    });
  };

  showSuccess = msg => {
    this.showAlert(msg, "success");
  };

  showError = msg => {
    this.showAlert(msg, "danger");
  };

  createAccount = async () => {
    const { accountName } = this.state;

    // check whether accountName is null or not
    if (!accountName) {
      this.setState({ isAlert: true }, () => {
        this.showAlert("Account name is required!");
      });
      return;
    }

    // check whether accountName is existed or not
    for (let i = 0; i < this.props.accountList.length; i++) {
      if (
        this.props.accountList[i].name.toLowerCase() ===
        accountName.toLowerCase()
      ) {
        this.showAlert("Account name is existed!");
        return;
      }
    }

    const result = await Account.createAccount(accountName, this.props.wallet);
    console.log("Result: ", result);
    if (result && result.key) {
      this.props.app.listAccounts(this.props.wallet);
      this.onFinish({ message: "Account is created!" });
    } else {
      this.showError("Create error!");
    }
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

  render() {
    const { classes } = this.props;
    const { showAlert } = this.state;

    return (
      <div className="" style={{ textAlign: "center" }}>
        {showAlert}
        <h1 className="mb-2" style={{ marginTop: "15px" }}>
          Create new account
        </h1>
        <div style={{ marginBottom: "0.4em;" }}>
          <span className="badge badge-pill badge-light">
            * This is some tips that user need to know
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
          onChange={evt => this.changeAccountName(evt)}
        />

        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          size="medium"
          onClick={() => this.createAccount()}
        >
          <IconSave
            className={classNames(classes.leftIcon, classes.iconSmall)}
          />
          Create Account
        </Button>
        <br />
        <Button
          variant="contained"
          size="small"
          color="warning"
          className={classes.button2}
          onClick={() => this.onFinish()}
        >
          Back
        </Button>
      </div>
    );
  }
}

CreateAccount.propTypes = {
  classes: PropTypes.object.isRequired
};

// higher-order component
export default withStyles(styles)(
  connectAccountListContext(
    connectWalletContext(connectAppContext(CreateAccount))
  )
);
