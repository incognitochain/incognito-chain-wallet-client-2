import styled from "styled-components";

export const Wrapper = styled.div`
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

export const Content = styled.div`
  position: relative;
  background-color: rgba(194, 194, 194, 0.2);
  height: 80px;
  width: 80px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Percent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  text-align: center;
  font-weight: 400;
  color: #3f51b5;
`;
