import React from "react";
import {
  Wrapper,
  Button,
  InfoWrapper,
  Title,
  IconSuccessed,
  IconFailed
} from "./styled";

export const STATUS = {
  SUCCESSED: "SUCCESSED",
  FAILED: "FAILED"
};

const CompletedInfo = ({
  children,
  title,
  onClose,
  type = STATUS.SUCCESSED,
  isPrivacy
}) => (
  <Wrapper isPrivacy={isPrivacy}>
    {type === STATUS.SUCCESSED ? <IconSuccessed /> : <IconFailed />}
    <Title>{title}</Title>
    <InfoWrapper>{children}</InfoWrapper>
    {onClose && <Button onClick={onClose}>Done</Button>}
  </Wrapper>
);

export default CompletedInfo;
