import React from 'react';
import TokenItem from './TokenItem';

const ListToken = ({ tokens, isGettingBalanceList }) => {
  return tokens.map(token => {
    const isGettingBalance = isGettingBalanceList.includes(token.symbol);
    return <TokenItem key={token.id} token={token} isGettingBalance={isGettingBalance} />;
  });
};

export default ListToken;