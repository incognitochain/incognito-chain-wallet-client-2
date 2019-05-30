import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { styled } from '@material-ui/styles';

const Container = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

const LoadingIcon = styled(CircularProgress)(({ theme: { colors } }) => ({
  color: colors.white
}));


const LoadingPage = () => (
  <Container>
    <LoadingIcon />
  </Container>
);

export default LoadingPage;