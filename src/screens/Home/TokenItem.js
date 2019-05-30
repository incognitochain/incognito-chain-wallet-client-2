import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { styled } from '@material-ui/styles';
import { CircularProgress } from '@material-ui/core';
import { TOKEN_DATA } from '@src/constants';
import formatUtil from '@src/utils/format';

const Container = styled('div')(({ theme: { spacing, colors, decors } }) => ({
  backgroundColor: colors.grey1,
  padding: spacing(1),
  borderRadius: decors.borderRadius,
  boxShadow: decors.boxShadow,
  marginBottom: spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}));

const LoadingIcon = styled(CircularProgress)(({ theme: { colors } }) => ({
  color: colors.white
}));

const Icon = styled('img')(({ theme: { spacing } }) => ({
  marginRight: spacing(2),
  width: 40,
  height: 40
}));

const Info = styled('div')({
  display: 'flex',
  flexDirection: 'column'
});

const ArrowIcon = styled('span')(({ theme: { spacing } }) => ({
  '&:before': {
    marginLeft: spacing(1),
    content: '">"'
  }
}));

const Group = styled('span')({
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  justifyContent: props => props.side === 'left' ? 'flex-start' : 'flex-end',
  flex: props => props.side === 'left' ? 3 : 2,
  marginRight: props => props.side === 'left' ? 5 : 0,
});

const WhiteText = styled('span')(({ theme: { colors } }) => ({
  color: colors.white
}));

const SubText = styled('span')(({ theme: { colors } }) => ({
  color: colors.grey
}));

const Balance = WhiteText;

const TokenItem = ({ token, isGettingBalance }) => {
  const tokenData = TOKEN_DATA.DATA[token.name];

  if (!tokenData) return null;

  return (
    <Container>
      <Group side='left'>
        <Icon src={tokenData.icon} />
        <Info>
          <WhiteText>{tokenData.fullName}</WhiteText>
          <SubText>{tokenData.typeName}</SubText>
        </Info>
      </Group>
      <Group side='right'>
        {
          isGettingBalance ? <LoadingIcon size={20} /> : (
            <Balance>{formatUtil.amount(token.amount, tokenData.symbol)} {tokenData.symbol}</Balance>
          )
        }
        <ArrowIcon />
      </Group>
    </Container>
  );
};

const mapState = (state, props) => ({
  isGettingBalance: state.token.isGettingBalance?.includes(props?.token?.symbol)
});

TokenItem.defaultProps = {
  isGettingBalance: false
};

TokenItem.propTypes = {
  token: PropTypes.object,
  isGettingBalance: PropTypes.bool
};

export default connect(mapState)(TokenItem);