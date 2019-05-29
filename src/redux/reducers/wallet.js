import type from '@src/redux/types/wallet';
// import { saveWallet } from '@src/services/wallet/WalletService';

const initialState = null;

const cloneWallet = wallet =>  Object.assign(
  Object.create(
    Object.getPrototypeOf(wallet)
  ),
  wallet
);

const reducer = (state = initialState, action) => {
  switch (action.type) {
  case type.SET:
    // saveWallet(action.data);
    return cloneWallet(action.data);
  case type.REMOVE:
    return initialState;
  default:
    return state;
  }
};

export default reducer;