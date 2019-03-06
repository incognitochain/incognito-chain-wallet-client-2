import React from "react";
import {
  Dialog,
  IconButton,
  Toolbar,
  AppBar,
  Slide,
  Typography
} from "@material-ui/core";
import styled from "styled-components";

const Transition = props => {
  return <Slide direction="up" {...props} />;
};

export function SearchFollowingTokensDialog({ isOpen, onClose }) {
  return (
    <Dialog
      fullScreen
      open={isOpen}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <Wrapper>Search ...</Wrapper>
    </Dialog>
  );
}

const Wrapper = styled.div``;
