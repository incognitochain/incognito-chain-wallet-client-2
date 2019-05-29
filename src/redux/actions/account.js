import type from '@src/redux/types/account';
import accountService from '@src/services/wallet/Account';
import { getPassphrase } from '@src/services/wallet/PasswordService';

export const setAccount = (account = throw new Error('Account object is required')) => ({
  type: type.SET,
  data: account
});

export const setBulkAccount = (accounts = throw new Error('Account array is required')) => {
  if (accounts && accounts.constructor !== Array) {
    throw new TypeError('Accounts must be an array');
  }

  return ({
    type: type.SET_BULK,
    data: accounts
  });
};

export const removeAccount = (account = throw new Error('Account is required')) => async (dispatch, getState) => {
  try {
    const wallet = getState()?.wallet;

    if (!wallet) {
      throw new Error('Wallet is not existed, can not remove account right now');
    }

    const { PrivateKey, name, }  = account;
    const passphrase = await getPassphrase();
    await accountService.removeAccount(
      PrivateKey,
      name,
      passphrase,
      wallet
    );

    dispatch({
      type: type.REMOVE_BY_NAME,
      data: name
    });

    return true;
  } catch (e) {
    throw e;
  }
};

export const getBalanceStart = accountName => ({
  type: type.GET_BALANCE,
  data: accountName
});

export const getBalanceFinish = accountName => ({
  type: type.GET_BALANCE_FINISH,
  data: accountName
});

export const setDefaultAccount = account => {
  accountService.saveDefaultAccountToStorage(account?.name);
  const _account = { ...account, default: true };
  return ({
    type: type.SET_DEFAULT_ACCOUNT,
    data: _account
  });
};

export const getBalance = (account = throw new Error('Account object is required')) => async (dispatch, getState) => {
  try {
    dispatch(getBalanceStart(account?.name));

    const wallet = getState()?.wallet;
    
    if (!wallet) {
      throw new Error('Wallet is not exist');
    }

    const balance = await accountService.getBalance(account, wallet);
    dispatch(setAccount({
      ...account,
      value: balance
    }));
    
    return balance;
  } catch (e) {
    throw e;
  } finally {
    dispatch(getBalanceFinish(account?.name));
  }
};