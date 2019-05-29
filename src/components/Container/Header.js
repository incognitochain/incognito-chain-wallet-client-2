import React from 'react';
import { styled } from '@material-ui/styles';
import menuIcon from '@src/assets/image/icon/icons-menu.webp';

const Container = styled('div')(({ theme: { spacing } }) => ({
  display: 'flex',
  backgroundColor: 'transparent',
  padding: spacing(1)
}));

const MenuIcon = styled('img')({
  display: 'flex',
  width: 28,
  cursor: 'pointer',
});

const Title = styled('span')(({ theme }) => ({
  textAlign: 'center',
  display: 'block',
  width: '100%',
  position: 'relative',
  left: -14,
  fontFamily: theme.fonts.spaceMono,
  fontWeight: 700,
  fontsize: 17,
  color: theme.colors.lightGreen,
  letterSpacing: 0
}));

const Header =  () => {
  return (
    <Container>
      <MenuIcon src={menuIcon} />
      <Title>Incognito</Title>
    </Container>
  );
};

export default Header;