import React from 'react';
import { styled } from '@material-ui/styles';
import Header from './Header';

const ContainerStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(1)
}));

const Container =  ({ children }) => {
  return (
    <ContainerStyled>
      <Header />
      <div>{children}</div>
    </ContainerStyled>
  );
};


export default Container;