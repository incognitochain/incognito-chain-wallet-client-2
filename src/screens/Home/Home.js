import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@material-ui/styles';
import { TOKEN_DATA } from '@src/constants';
import Button from '@src/components/core/Button';
import ListToken from './ListToken';
import TokenItem from './TokenItem';

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%'
});

const ListWrapper = styled('div')(({ theme: { spacing } }) => ({
  marginTop: spacing(7),
}));

const AddTokenWrapper = styled('div')(({ theme: { palette, spacing } }) => ({
  backgroundColor: palette.background.default,
  minHeight: 180,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: spacing(3, 0)
}));

const WhiteText = styled('span')(({ theme: { spacing } }) => ({
  marginBottom: spacing(1),
}));

const Home = ({ tokens, account, isGettingBalanceList, onSelectToken, openModal }) => {
  const isPrvLoadingBalance = isGettingBalanceList.includes(account.name);
  const handleAddToken = () => {
    openModal({
      component: () => 'Add token',
      title: 'Add token'
    });
  };
  
  return (
    <Container>
      <ListWrapper>
        <TokenItem
          token={{ name: TOKEN_DATA.SYMBOL.PRV, amount: account?.amount, symbol: TOKEN_DATA.SYMBOL.PRV }}
          isGettingBalance={isPrvLoadingBalance}
          onSelect={onSelectToken}
        />
        <ListToken tokens={tokens} isGettingBalanceList={isGettingBalanceList} onSelectToken={onSelectToken} />
      </ListWrapper>
      <AddTokenWrapper>
        <WhiteText>Don’t see your token?</WhiteText>
        <Button onClick={handleAddToken}>{'Add a token >'}</Button>
      </AddTokenWrapper>
    </Container>
  );
};

Home.propTypes = {
  isGettingBalanceList: PropTypes.array,
  account: PropTypes.object,
  tokens: PropTypes.array,
  onSelectToken: PropTypes.func.isRequired
};

export default Home;