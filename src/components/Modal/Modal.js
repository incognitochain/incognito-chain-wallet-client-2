import React from 'react';
import PropTypes from 'prop-types';
import { Modal as MdModal } from '@material-ui/core';
import { styled } from '@material-ui/styles';
import modalBg from '@src/assets/image/modal-bg.webp';
import iconBack from '@src/assets/image/icon/icon-back.webp';

const Container = styled('div')(({ theme: { palette, spacing } }) => ({
  maxWidth: 700,
  margin: 'auto',
  padding: spacing(1),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: `${palette.background.default} url(${modalBg})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'contain',
}));

const Header = styled('div')(({ theme: { decors } }) => ({
  backgroundColor: 'transparent',
  flexBasis: decors.headerHeight,
  display: 'flex',
  alignItems: 'center',
}));

const Content = styled('div')(({ theme: { spacing } }) => ({
  flex: 1,
  padding: spacing(1, 0),
}));

const BackIcon = styled('img')(({ theme: { spacing } }) => ({
  width: 10,
  cursor: 'pointer',
  flexBasis: spacing(1.7),
  padding: spacing(1,1,1,0)
}));

const Title = styled('span')(({ theme: { spacing, colors, fonts } }) => ({
  display: 'block',
  flex: 1,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: spacing(0, 1),
  fontFamily: fonts.spaceMono,
  fontSize: 17,
  color: colors.white,
  letterSpacing: 0,
}));

const Modal = ({ children, title, onClose, ...otherProps }) => (
  <MdModal {...otherProps}>
    <Container className='bounceInUp-ani'>
      <Header>
        <BackIcon src={iconBack} onClick={onClose} />
        <Title>{title ?? 'Incognito'}</Title>
      </Header>
      <Content>
        {children}
      </Content>
    </Container>
  </MdModal>
);

Modal.propTypes = {
  children: PropTypes.any,
  title: PropTypes.string,
  onClose: PropTypes.func
};

export default Modal;