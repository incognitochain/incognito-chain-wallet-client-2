import React from "react";

export const AccountContext = React.createContext({
  PaymentAddress: "",
  PrivateKey: "",
  PublicKey: "",
  PublicKeyCheckEncode: "",
  PublicKeyBytes: "",
  ReadonlyKey: "",
  name: ""
  // value: 0 // WARNING: get account balance from AccountListContext instead
});

// hook
export const useAccountContext = () => {
  return React.useContext(AccountContext);
};

// HOC for class component that we don't have time to refactor yet
export const connectAccountContext = WrappedComponent => {
  return props => {
    const account = useAccountContext();
    return <WrappedComponent {...props} account={account} />;
  };
};
