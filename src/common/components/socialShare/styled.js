import styled from "styled-components";

export const Wrapper = styled.div`
  display: block;
  padding: 25px 0px;
`;
export const Title = styled.span`
  font-size: 18px;
  margin-bottom: 10px;
  display: block;
  font-weight: 500;
`;
export const Content = styled.div`
  display: flex;
  > div {
    cursor: pointer;
    transition: transform 300ms;
  }
  > div:hover {
    transform: scale(1.05);
    transform-origin: 50% 50%;
  }
  > div:not(:last-child) {
    margin-right: 20px;
  }
`;
