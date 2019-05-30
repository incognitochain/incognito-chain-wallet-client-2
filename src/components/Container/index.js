import React from 'react';
import { styled } from '@material-ui/styles';
import bg from '@src/assets/image/incoginito-bg.webp';
import Header from './Header';

const ContainerStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundImage: `url(${bg})`,
  height: '100%',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'contain',
  display: 'flex',
  flexDirection: 'column'
}));

const Content = styled('div')({
  minWidth: '100%',
  flex: 1
});

const Container =  ({ children }) => {
  return (
    <ContainerStyled>
      <Header />
      <Content>{children}</Content>
    </ContainerStyled>
  );
};


export default Container;