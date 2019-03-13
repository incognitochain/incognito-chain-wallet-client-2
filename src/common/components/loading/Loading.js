import React from "react";
import { CircularProgress } from "@material-ui/core";
import styled from "styled-components";
import cls from "classnames";

export function Loading({ isShow, fullscreen }) {
  return isShow ? (
    <Wrapper className={cls({ fullscreen })}>
      <CircularProgress color="secondary" />
    </Wrapper>
  ) : null;
}

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.25);
  &.fullscreen {
    position: fixed;
  }
`;
