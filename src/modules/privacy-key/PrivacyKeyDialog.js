import React from "react";
import { Modal } from "common/components/modal";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useAccountContext } from "../../common/context/AccountContext";
import toastr from "toastr";
import styled from "styled-components";
import { ReactComponent as CopyPasteSVG } from "../../assets/images/copy-paste.svg";

export function PrivacyKeyDialog({ isOpen, onClose }) {
  const { PrivateKey, ReadonlyKey } = useAccountContext();
  const copyToClipBoard = () => {
    toastr.success("Copied!");
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Detail">
      <Wrapper>
        <CopyToClipboard text={ReadonlyKey} onCopy={copyToClipBoard}>
          <div className="wrapperKeys">
            <div className="titleKeys">
              <div className="keyNameReadonly">READONLY KEY</div>
              <span className="clickCopy">
                <CopyPasteSVG />
              </span>
            </div>
            <div className="keyDes">{ReadonlyKey}</div>
          </div>
        </CopyToClipboard>

        <CopyToClipboard text={PrivateKey} onCopy={copyToClipBoard}>
          <div className="wrapperKeys">
            <div className="titleKeys">
              <div className="keyNamePrivacy">PRIVATE KEY</div>
              <span className="clickCopy">
                <CopyPasteSVG />
              </span>
            </div>
            <div className="keyDes">{PrivateKey}</div>
          </div>
        </CopyToClipboard>
      </Wrapper>
    </Modal>
  );
}

const Wrapper = styled.div`
  flex: 1;
  flex-direction: column;
  overflow: scroll;
  .wrapperKeys {
    cursor: pointer;
  }
`;
