import React from "react";
import { Wrapper, Button, InfoWrapper, Title, Icon } from "./styled";

const CompletedInfo = ({ children, title, onDone }) => (
  <Wrapper>
    <Icon />
    <Title>{title}</Title>
    <InfoWrapper>{children}</InfoWrapper>
    <Button onClick={onDone}>Done</Button>
  </Wrapper>
);

export default CompletedInfo;
