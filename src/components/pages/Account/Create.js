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
    if (!accountName) {
      this.setState({ isAlert: true }, () => {
        this.showAlert("Account name is required!");
      });
      return;
    }

    const result = await Account.createAccount(accountName);
    if (result && result.PaymentAddress) {
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
      <div className="">
        {showAlert}
        <h1 className="mb-2">Create new account</h1>
        <div>
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
          size="large"
          color="primary"
          className={classes.button}
          fullWidth
          onClick={() => this.createAccount()}
        >
          <IconSave
            className={classNames(classes.leftIcon, classes.iconSmall)}
          />
          Create Account
        </Button>
        <Button
          variant="contained"
          size="small"
          color="default"
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

export default withStyles(styles)(connectWalletContext(CreateAccount));
