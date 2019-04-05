import React, { Component } from "react";
import { Modal } from "@material-ui/core";
import QrReader from "react-qr-reader";
import Dialog from "@src/components/core/Dialog";
import Icon from "@material-ui/icons/CropFree";
import { Wrapper, TriggerIcon, QrWrapper } from "./styled";

class QRScanner extends Component {
  constructor() {
    super();
    this.state = {
      result: null
    };

    this.dialog = null;
  }

  handleScan = data => {
    const { onData } = this.props;
    if (data) {
      this.setState(
        {
          result: data
        },
        () => {
          if (this.dialog) {
            this.dialog.close();
          }
          if (typeof onData === "function") {
            onData(data);
          }
        }
      );
    }
  };

  handleError = err => {
    console.error(err);
  };

  onTrigger = () => {
    if (this.dialog) {
      this.dialog.open();
    }
  };

  toggleModal = isShow => {
    this.setState(({ open }) => ({
      open: typeof isShow === "boolean" ? isShow : !open
    }));
  };

  render() {
    const { className } = this.props;
    return (
      <Wrapper className={className}>
        <TriggerIcon onClick={this.onTrigger}>
          <Icon />
        </TriggerIcon>
        <Dialog title="Scan QR" onRef={modal => (this.dialog = modal)}>
          <QrWrapper>
            <QrReader
              delay={300}
              onError={this.handleError}
              onScan={this.handleScan}
              style={{ width: "100%" }}
            />
          </QrWrapper>
        </Dialog>
      </Wrapper>
    );
  }
}

export default QRScanner;
