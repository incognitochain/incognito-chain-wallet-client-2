import styled from "styled-components";
import CheckCircleOutline from "@material-ui/icons/DoneOutline";
import CloseOutline from "@material-ui/icons/Close";

export const Wrapper = styled.div`
  background-color: #2d4cf5;
  min-width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Button = styled.button`
  background-color: white;
  color: #2d4cf5;
  padding: 10px 20px;
  min-width: 300px;
  font-weight: bold;
  font-size: 20px;
  border-radius: 4px;
  cursor: pointer;
`;

export const InfoWrapper = styled.div`
  padding: 30px 0px;
  color: white;
  display: flex;
  flex-direction: column;
`;

export const Title = styled.span`
  font-size: 25px;
  color: white;
`;

export const IconSuccessed = styled(CheckCircleOutline)`
  font-size: 100px !important;
  color: white;
`;

export const IconFailed = styled(CloseOutline)`
  font-size: 100px !important;
  color: white;
`;
