import React from 'react';
import { connect } from 'react-redux';
import { closeModal } from '@src/redux/actions/modal';
import Modal from './Modal';

const ModalProvider = ({ modals, closeModal }) => {
  return modals && modals.map(modal => {
    const handleClose = () => closeModal(modal?.id);
    return (
      <Modal key={modal?.id} open title={modal?.title} onClose={handleClose}>
        {modal?.component}
      </Modal>
    );
  });
};

const mapState = state => ({
  modals: state.modal.opening || []
});

const mapDispatch = { closeModal };

export default connect(mapState, mapDispatch)(ModalProvider);