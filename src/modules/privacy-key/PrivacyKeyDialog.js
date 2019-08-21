import React from "react";
import { Modal } from "@common/components/modal";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useAccountContext } from "../../common/context/AccountContext";
import toastr from "toastr";
import styled from "styled-components";
import { ReactComponent as CopyPasteSVG } from "@assets/images/copy-paste.svg";
import { getShardIDFromLastByte } from "incognito-chain-web-js/build/wallet";

export function PrivacyKeyDialog({ isOpen, onClose }) {
  console.log("useAccountContext()", useAccountContext());
  const {
    PrivateKey,
    ReadonlyKey,
    // PublicKey,
    PublicKeyCheckEncode,
    PublicKeyBytes
  } = useAccountContext();

  let pkBytes = PublicKeyBytes.split(",");
  const shardID = getShardIDFromLastByte(pkBytes[pkBytes.length - 1]);
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
            <div className="keyDes">
              {ReadonlyKey.substring(0, 20) + "..." + ReadonlyKey.substring(90)}
            </div>
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
            <div className="keyDes">
              {PrivateKey.substring(0, 20) + "..." + PrivateKey.substring(90)}
            </div>
          </div>
        </CopyToClipboard>

        {/* <CopyToClipboard text={PublicKey} onCopy={copyToClipBoard}>
          <div className="wrapperKeys">
            <div className="titleKeys">
              <div className="keyNamePublic">PUBLIC KEY IN HEX</div>
              <span className="clickCopy">
                <CopyPasteSVG />
              </span>
            </div>
            <div className="keyDes">
              {PublicKey
                ? PublicKey.substring(0, 20) + "..." + PublicKey.substring(90)
                : ""}
            </div>
          </div>
        </CopyToClipboard> */}

        <CopyToClipboard text={PublicKeyCheckEncode} onCopy={copyToClipBoard}>
          <div className="wrapperKeys">
            <div className="titleKeys">
              <div className="keyNamePublicCheckEncode">
                PUBLIC KEY BASE58 CHECK ENCODE
              </div>
              <span className="clickCopy">
                <CopyPasteSVG />
              </span>
            </div>
            <div className="keyDes">
              {PublicKeyCheckEncode
                ? PublicKeyCheckEncode.substring(0, 20) +
                  "..." +
                  PublicKeyCheckEncode.substring(30)
                : ""}
            </div>
          </div>
        </CopyToClipboard>

        <CopyToClipboard text={shardID} onCopy={copyToClipBoard}>
          <div className="wrapperKeys">
            <div className="titleKeys">
              <div className="keyNamePublicBytes">SHARD ID</div>
              <span className="clickCopy">
                <CopyPasteSVG />
              </span>
            </div>
            <div className="keyDes">{shardID}</div>
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
