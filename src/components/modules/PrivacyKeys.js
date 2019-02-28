import React from "react";
import PropTypes from "prop-types";
import {
  ListItemText,
  ListItem,
  Avatar,
  Snackbar,
  Button
} from "@material-ui/core";

import {
  Error as IconError,
  CheckCircle as IconSuccess,
  Warning as IconWarning,
  Remove as IconRemove
} from "@material-ui/icons";

import { CopyToClipboard } from "react-copy-to-clipboard";
import { Modal } from "common/components/modal";
import "./PrivacyKeys.scss";
import styled from "styled-components";

class PrivacyKeys extends React.Component {
  static propTypes = {
    paymentAddress: PropTypes.string.isRequired,
    readonlyKey: PropTypes.string.isRequired,
    privateKey: PropTypes.string.isRequired,
    onRemoveAccount: PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      showAlert: "",
      isAlert: false
    };
  }

  handleOnRemoveAccount = () => {
    this.props.onRemoveAccount();
  };

  handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({ showAlert: "", isAlert: false });
  };

  copyToClipBoard = () => {
    this.showAlert("Copied!", "info");
  };

  showAlert = (msg, flag = "warning") => {
    let showAlert = "",
      isAlert = true,
      icon = <IconWarning />;

    if (flag === "success") icon = <IconSuccess />;
    else if (flag === "danger") icon = <IconError />;
    else icon = "";

    this.setState({ isAlert }, () => {
      showAlert = (
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center"
          }}
          open={isAlert}
          autoHideDuration={2000}
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

  renderReadonlyKey = () => {
    const { readonlyKey } = this.props;
    return (
      <CopyToClipboard text={readonlyKey} onCopy={() => this.copyToClipBoard()}>
        <div className="wrapperKeys">
          <div className="titleKeys">
            <div className="keyNameReadonly">READONLY KEY</div>
            <span className="clickCopy">Click to copy</span>
          </div>
          <div className="keyDes">{readonlyKey}</div>
        </div>
      </CopyToClipboard>
    );
  };

  renderPrivacyKey = () => {
    const { privateKey } = this.props;
    return (
      <CopyToClipboard text={privateKey} onCopy={() => this.copyToClipBoard()}>
        <div className="wrapperKeys">
          <div className="titleKeys">
            <div className="keyNamePrivacy">PRIVATE KEY</div>
            <div className="clickCopy">Click to copy</div>
          </div>
          <div className="keyDes">{privateKey}</div>
        </div>
      </CopyToClipboard>
    );
  };
  renderRemoveAccount = () => {
    return (
      <ListItem>
        <Avatar>
          <IconRemove />
        </Avatar>
        <ListItemText
          disableTypography
          primary={
            <span className="btn text-danger cursor-pointer pl-0">
              Remove account
            </span>
          }
          onClick={this.handleOnRemoveAccount}
        />
      </ListItem>
    );
  };

  render() {
    const { showAlert } = this.state;

    return (
      <div className="wrapperPrivacyKeyContainer">
        {showAlert}
        <ButtonWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.setState({ showKeyModal: true })}
          >
            Show Privacy Key
          </Button>
        </ButtonWrapper>

        <Modal
          isOpen={this.state.showKeyModal}
          onClose={() => this.setState({ showKeyModal: false })}
        >
          <>
            {this.renderReadonlyKey()}
            {this.renderPrivacyKey()}
          </>
        </Modal>

        {this.renderRemoveAccount()}
      </div>
    );
  }
}
export default PrivacyKeys;

const ButtonWrapper = styled.div`
  text-align: center;
`;
