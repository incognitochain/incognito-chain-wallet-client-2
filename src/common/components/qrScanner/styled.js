import styled from "styled-components";

export const Wrapper = styled.div``;

export const TriggerIcon = styled.div`
  cursor: pointer;
  width: fit-content;
`;

export const QrWrapper = styled.div`
  text-align: center;
  max-width: 500px;
  margin: auto;
  height: ${props => (props.hide ? "0px" : "auto")};
  overflow: ${props => (props.hide ? "hidden" : "unset")};
`;

export const Error = styled.span`
  display: block;
  color: red;
  font-size: 16px;
  padding: 10px;
  text-align: center;
`;

export const Info = styled.span`
  display: block;
  color: green;
  font-size: 16px;
  padding: 10px;
  text-align: center;
`;

export const Button = styled.button`
  background-color: #2c4cf5;
  padding: 10px 20px;
  margin: auto;
  border-radius: 4px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
`;

export const ChooseNewImage = styled.button`
  background-color: transparent;
  padding: 10px 20px;
  margin: auto;
  color: #2c4cf5;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  border: none;
  text-decoration: underline;
`;
