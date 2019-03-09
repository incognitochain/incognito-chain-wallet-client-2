import React from "react";

export const AppContext = React.createContext({
  listAccounts: () => {},
  appDispatch: () => {}
});

export function useAppContext() {
  return React.useContext(AppContext);
}

export const connectAppContext = WrappedComponent => {
  return props => {
    const app = useAppContext();
    return <WrappedComponent {...props} app={app} />;
  };
};
