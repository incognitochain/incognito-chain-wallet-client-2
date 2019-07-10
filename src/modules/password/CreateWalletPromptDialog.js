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
      <DialogTitle>New Wallet</DialogTitle>
      <DialogContent>
        <DialogContentText>
          It looks like you’re a new user. Let’s create a new wallet for you.
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
