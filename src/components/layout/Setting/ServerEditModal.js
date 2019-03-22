import React from "react";
import { Modal } from "@common/components/modal";
import ServerAddOrEdit from "./ServerAddOrEdit";

function ServerEditModal({ isOpen, onClose, server = {}, onFinishSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ServerAddOrEdit
        isEdit={true}
        name={server.name}
        address={server.address}
        username={server.username}
        password={server.password}
        onFinish={onFinishSave}
      />
    </Modal>
  );
}

export default ServerEditModal;
