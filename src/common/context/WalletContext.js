import React from "react";

export const WalletContext = React.createContext({
  wallet: {}
});

export function useWalletContext() {
  return React.useContext(WalletContext);
}

export const connectWalletContext = WrappedComponent => {
  return props => {
    const { wallet } = useWalletContext();
    return <WrappedComponent {...props} wallet={wallet} />;
  };
};
