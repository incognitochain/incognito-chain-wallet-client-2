import React from "react";

export const AccountListContext = React.createContext([]);

// hook
export const useAccountListContext = () => {
    return React.useContext(AccountListContext);
};

// HOC for class component that we don't have time to refactor yet
export const connectAccountListContext = WrappedComponent => {
    return props => {
        const accountList = useAccountListContext();
        return <WrappedComponent {...props} accountList={accountList} />;
    };
};