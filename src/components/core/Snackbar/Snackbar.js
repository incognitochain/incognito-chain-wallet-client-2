import React, { useState, useEffect } from 'react';
import { Snackbar as CoreSnackbar, IconButton, SnackbarContent } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import useStyles from './styles';

let com;

export const closeSnackbar = () => {
  if (typeof com?.handleClose === 'function') {
    com.handleClose();
  }
};

export const openSnackbar = ({ message, type }) => {
  if (typeof com?.handleOpen === 'function') {
    com.handleOpen({ message, type });
  }
};

const Snackbar = ({ message: messageProps, timeout, type: typeProps }) => {
  const [ open, setOpen ] = useState(false);
  const [ message, setMessge ] = useState(null);
  const [ type, setType ] = useState(null);
  const classes = useStyles();
  const handleClose = () => setOpen(false);
  const handleOpen = ({ message, type }) => {
    setOpen(true);
    message && setMessge(message);
    type && setType(type);
  };

  const handleEffect = () => {
    com = {
      handleClose, 
      handleOpen
    };

    messageProps && setMessge(messageProps);
    typeProps && setType(typeProps);
  };

  useEffect(handleEffect, []);

  return (
    <CoreSnackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={open}
      autoHideDuration={timeout}
      onClose={handleClose}
    >
      <SnackbarContent
        className={clsx(classes[type])}
        message={<span className={classes.message}>{message}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
    </CoreSnackbar>
  );
};

Snackbar.defaultProps = {
  timeout: 6000,
  type: 'info'
};

Snackbar.propTypes = {
  message: PropTypes.string,
  timeout: PropTypes.number,
  type: PropTypes.oneOf(['error', 'info', 'warning', 'success'])
};

export default Snackbar;