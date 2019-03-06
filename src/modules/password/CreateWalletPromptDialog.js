import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export function CreateWalletPromptDialog({ isOpen, onClose, onCreate }) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Create Wallet</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Your password does not match with any wallet. Do you want to create a
          new wallet?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="default">
          Cancel
        </Button>
        <Button onClick={onCreate} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
