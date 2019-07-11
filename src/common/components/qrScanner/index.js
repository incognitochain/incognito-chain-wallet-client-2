import React, { Component } from "react";
import QrReader from "react-qr-reader";
import Dialog from "@src/components/core/Dialog";
import BrowserDetect from "@src/services/BrowserDetect";
import SwitchIcon from "@material-ui/icons/Cached";
import {
  Wrapper,
  Trigger,
  QrWrapper,
  Error,
  Button,
  Info,
  ChooseNewImage
} from "./styled";

const initialState = {
  result: null,
  error: null,
  info: null,
  legacyMode: false
};
class QRScanner extends Component {
  constructor() {
    super();
    this.state = {
      ...initialState
    };

    this.dialog = null;
    this.qr = React.createRef();
  }

  componentDidMount() {
    this.setState({ legacyMode: this.checkLegacy() });
  }

  checkLegacy = () => {
    return BrowserDetect.isIphone && !BrowserDetect.isSafari;
  };

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
    } else {
      this.setState({
        info: "Please try again, we can not detect your image data"
      });
    }
  };

  handleError = error => {
    this.setState({
      error: "Your camera said no. Please upload the QR code image instead."
    });
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

  toggleMode = () => {
    this.setState(
      ({ legacyMode }) => ({ ...initialState, legacyMode: !legacyMode }),
      () => {
        const { legacyMode } = this.state;
        legacyMode && this.chooseImage();
      }
    );
  };

  chooseImage = () => {
    this.qr?.current?.openImageDialog();
  };

  render() {
    const { className } = this.props;
    const { error, info, legacyMode } = this.state;
    return (
      <Wrapper className={className}>
        <Trigger onClick={this.onTrigger}>Scan QR</Trigger>
        <Dialog title="Scan QR code" onRef={modal => (this.dialog = modal)}>
          <QrWrapper hide={legacyMode}>
            <QrReader
              ref={this.qr}
              delay={300}
              onError={this.handleError}
              onScan={this.handleScan}
              style={{ width: "100%" }}
              legacyMode={legacyMode}
            />
          </QrWrapper>
          <Button onClick={this.toggleMode}>
            <SwitchIcon />
            {legacyMode ? "Scan QR image" : "Upload QR image"}
          </Button>
          {legacyMode && (
            <ChooseNewImage onClick={this.chooseImage}>
              Choose a new QR image
            </ChooseNewImage>
          )}
          {error && <Error>Error: {error}</Error>}
          {info && <Info>Info: {info}</Info>}
        </Dialog>
      </Wrapper>
    );
  }
}

export default QRScanner;
