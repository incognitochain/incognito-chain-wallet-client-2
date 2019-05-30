import type from '@src/redux/types/token';

export const setToken = (token = throw new Error('Token object is required')) => ({
  type: type.SET,
  data: token
});

export const setBulkToken = (tokens = throw new Error('Token array is required')) => {
  if (tokens && tokens.constructor !== Array) {
    throw new TypeError('Tokens must be an array');
  }

  return ({
    type: type.SET_BULK,
    data: tokens
  });
};

export const getBalanceStart = tokenSymbol => ({
  type: type.GET_BALANCE,
  data: tokenSymbol
});

export const getBalanceFinish = tokenSymbol => ({
  type: type.GET_BALANCE_FINISH,
  data: tokenSymbol
});

export const setDefaultToken = token => {
  return ({
    type: type.SET_DEFAULT,
    data: token
  });
};

export const getBalance = (token = throw new Error('Token object is required')) => async (dispatch, getState) => {
  try {
    dispatch(getBalanceStart(token?.symbol));

    const wallet = getState()?.wallet;
    const account = getState()?.account.defaultAccount;
    
    if (!wallet) {
      throw new Error('Wallet is not exist');
    }

    if (!account) {
      throw new Error('Account is not exist');
    }

    const accountWallet = wallet.getAccountByName(account?.name);

    const balance = await accountWallet.getPrivacyCustomTokenBalance(token.id);
    dispatch(setToken({
      ...token,
      amount: balance
    }));
    
    return balance;
  } catch (e) {
    throw e;
  } finally {
    dispatch(getBalanceFinish(token?.symbol));
  }
};