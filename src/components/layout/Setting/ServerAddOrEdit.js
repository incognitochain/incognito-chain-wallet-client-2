import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Server from "../../../services/Server";
import { Button, Snackbar, TextField } from "@material-ui/core";

import {
  Error as IconError,
  CheckCircle as IconSuccess,
  Warning as IconWarning
} from "@material-ui/icons";

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
  }
});

const addressFocus = input => {
  input && input.focus();
};

class ServerAddOrEdit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      servers: false,
      name: props.name || "",
      originAddress: props.address,
      address: props.address || "",
      username: props.username || "",
      password: props.password || "",
      showAlert: "",
      isDefault: false,
      isAlert: false
    };
  }

  async componentDidMount() {
    const servers = await Server.get();
    this.setState({ servers });
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

  showWarning = msg => {
    this.showAlert(msg, { flag: "warning" });
  };

  showError = msg => {
    this.showAlert(msg, { flag: "danger" });
  };

  saveServer = () => {
    let { name, servers, address, username, password, isDefault } = this.state;

    if (!address) {
      this.setState({ isAlert: true }, () => {
        this.showWarning("RPC address is required!");
      });
      return;
    }

    if (!servers) {
      servers = [];
      isDefault = true;
    } else {
      if (this.props.isEdit) {
        for (let s of servers.filter(
          ({ address }) => address !== this.props.originAddress
        )) {
          if (s.address === address) {
            this.showWarning("Address is exist!");
            return;
          }
        }
      } else {
        for (let s of servers) {
          if (s.address === address) {
            this.showWarning("Address is exist!");
            return;
          }
        }
      }
    }

    if (this.props.isEdit) {
      const editedIndex = servers.findIndex(
        s => s.address === this.props.originAddress
      );
      Server.set([
        ...servers.slice(0, editedIndex),
        { address, username, password, name, default: isDefault },
        ...servers.slice(editedIndex + 1)
      ]);
    } else {
      Server.set([
        ...servers,
        { address, username, password, name, default: isDefault }
      ]);
    }

    this.onFinish({ message: "Add server success!" });
  };

  changeAddress = e => {
    this.setState({ address: e.target.value });
  };

  changeUsername = e => {
    this.setState({ username: e.target.value });
  };

  changePassword = e => {
    this.setState({ password: e.target.value });
  };

  changeName = e => {
    this.setState({ name: e.target.value });
  };

  onFinish = data => {
    const { onFinish } = this.props;

    if (onFinish) {
      onFinish(data);
    }
  };

  render() {
    const { classes } = this.props;
    const { address, username, showAlert, password, name } = this.state;

    return (
      <div style={{ padding: "2rem" }}>
        {showAlert}
        <TextField
          required
          id="serverAddress"
          label="RPC server address"
          inputRef={addressFocus}
          className={classes.textField}
          margin="normal"
          variant="outlined"
          value={address}
          onChange={evt => this.changeAddress(evt)}
        />

        <TextField
          id="Username"
          label="Username"
          className={classes.textField}
          margin="normal"
          variant="outlined"
          value={username}
          onChange={evt => this.changeUsername(evt)}
        />

        <TextField
          id="Password"
          label="Password"
          className={classes.textField}
          margin="normal"
          variant="outlined"
          value={password}
          onChange={evt => this.changePassword(evt)}
        />

        <TextField
          id="name"
          label="Name"
          className={classes.textField}
          margin="normal"
          variant="outlined"
          value={name}
          onChange={evt => this.changeName(evt)}
        />

        <Button
          variant="contained"
          size="large"
          color="primary"
          className={classes.button}
          fullWidth
          onClick={() => this.saveServer()}
        >
          Save
        </Button>
      </div>
    );
  }
}

ServerAddOrEdit.propTypes = {
  classes: PropTypes.object.isRequired,
  isEdit: PropTypes.bool
};

export default withStyles(styles)(ServerAddOrEdit);
