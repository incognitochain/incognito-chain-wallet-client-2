import React from "react";
import { Modal } from "common/components/modal";
import ServerAddOrEdit from "./ServerAddOrEdit";

function ServerEditModal({ isOpen, onClose, server }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ServerAddOrEdit
        isEdit={true}
        name={server.name}
        address={server.address}
        username={server.username}
        password={server.password}
      />
    </Modal>
  );
}

export default ServerEditModal;
