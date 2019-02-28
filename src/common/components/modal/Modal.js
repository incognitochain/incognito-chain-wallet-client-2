import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import {
  Dialog,
  IconButton,
  Toolbar,
  AppBar,
  Slide,
  Typography
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const Transition = props => {
  return <Slide direction="up" {...props} />;
};

const styles = {
  appBar: {
    position: "relative"
  },
  flex: {
    flex: 1
  }
};

const Modal = props => {
  const { title, children, buttonAction, classes } = props;

  return (
    <div className="modal">
      <Dialog
        fullScreen
        open={props.isOpen}
        onClose={props.onClose}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
          <Toolbar style={{ padding: "0 10px" }}>
            <IconButton
              color="inherit"
              onClick={props.onClose}
              aria-label="Close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.flex}>
              {title}
            </Typography>
            {buttonAction}
          </Toolbar>
        </AppBar>
        <div>{children}</div>
      </Dialog>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  onRef: PropTypes.func,
  onClose: PropTypes.func,
  hideButtonClose: PropTypes.bool,
  buttonAction: PropTypes.any
};

export default withStyles(styles)(Modal);
