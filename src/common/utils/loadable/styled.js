import styled from "styled-components";
import Icon from "@material-ui/icons/Refresh";

import { fadeIn } from "@src/common/animations";

export const Container = styled.div`
  padding: 20px;
`;

export const FadeIn = styled.div`
  display: flex;
  flex: 1;
  animation: ${fadeIn} 300ms linear;
`;

export const Error = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 200px;
  margin: auto;
  button {
    width: 80px;
    background: transparent;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: green;
  }
`;

export const LoadingIcon = styled(Icon)``;

export const LoadingPage = styled.div`
  display: block;
  width: 100%;
  height: 100%;
  padding: 20px;
`;
