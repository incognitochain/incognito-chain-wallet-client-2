import { loadWallet, initWallet, loadListAccount } from '@src/services/wallet/WalletService';
import { getPassphrase } from '@src/services/wallet/PasswordService';
import type from '@src/redux/types/wallet';
import { setBulkAccount } from '@src/redux/actions/account';

export const setWallet = (wallet = throw new Error('Wallet object is required')) => ({
  type: type.SET,
  data: wallet
});

export const removeWallet = () => ({
  type: type.REMOVE,
});

// export const reloadAccountList = () => (dispatch, getState) => {
//   const wallet = getState()?.wallet;
//   if (!wallet) {
//     return;
//   }

//   return loadListAccount(wallet)
//     .then(accounts => {
//       dispatch(setBulkAccount(accounts));
//     });
// };

export const reloadWallet = (passphrase) => async (dispatch) => {
  try {
    const _passphrase = passphrase || await getPassphrase();
    if (!_passphrase) {
      return;
    }
  
    const wallet = await loadWallet(_passphrase);

    if (wallet) {
      dispatch(setWallet(wallet));
  
      const accounts = await loadListAccount(wallet);
      dispatch(setBulkAccount(accounts));
    
      return wallet;
    }
    return false;
  } catch (e) {
    throw e;
  }
};

export const initWalletAction = () => async (dispatch) => {
  try {
    const wallet = await initWallet();

    if (wallet) {
      dispatch(setWallet(wallet));
  
      const accounts = await loadListAccount(wallet);
      dispatch(setBulkAccount(accounts));
    
      return wallet;
    }
    return false;
  } catch (e) {
    throw e;
  }
};