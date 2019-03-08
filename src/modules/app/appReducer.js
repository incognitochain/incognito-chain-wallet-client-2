export const initialAppState = {
  screen: "",
  headerTitle: "Wallet home",
  showAlert: "",
  isAlert: false,
  selectedAccount: {},
  accounts: [],
  shouldShowHeader: true
};

export function appReducer(state = initialAppState, action) {
  switch (action.type) {
    case "SET_BALANCES":
      console.log("###action.balances", action.balances);
      return {
        ...state,
        accounts: state.accounts.map(account => ({
          ...account,
          value: action.balances.find(
            ({ accountName }) => accountName === account.name
          ).balance
        }))
      };
    case "LOAD_ACCOUNTS":
      return {
        ...state,
        loading: true,
        accounts: []
      };
    case "LOAD_ACCOUNTS_SUCCESS":
      return {
        ...state,
        walletName: action.walletName,
        loading: false,
        selectedAccount: action.selectedAccount,
        accounts: action.accounts
      };
    case "SHOW_ALERT":
      return {
        ...state,
        isAlert: true,
        showAlert: action.showAlert
      };
    case "CLOSE_ALERT":
      return {
        ...state,
        showAlert: "",
        isAlert: false
      };
    case "SET_SCREEN":
      return {
        ...state,
        screen: action.screen,
        shouldShowHeader: action.shouldShowHeader,
        headerTitle: action.headerTitle
      };
    case "SET_SELECTED_ACCOUNT":
      return {
        ...state,
        selectedAccount: action.selectedAccount
      };

    case "SET_WALLET":
      return {
        ...state,
        wallet: action.wallet
      };
    case "SET_SELECTED_ACCOUNT_BALANCE":
      return {
        ...state,
        selectedAccount: {
          ...state.selectedAccount,
          value: action.balance
        }
      };
    default:
      throw new Error("Unknown action type", action);
  }
}
