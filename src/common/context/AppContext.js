import React from "react";

export const AppContext = React.createContext({
  listAccounts: () => {}
});

export function useAppContext() {
  return React.useContext(AppContext);
}
