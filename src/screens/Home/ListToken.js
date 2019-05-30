import React from 'react';
import TokenItem from './TokenItem';

const ListToken = ({ tokens }) => {
  return tokens.map(token => <TokenItem key={token.id} token={token} />);
};


export default ListToken;