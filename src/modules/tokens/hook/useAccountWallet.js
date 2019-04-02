import { useWalletContext } from "../../../common/context/WalletContext";
import { useAccountContext } from "../../../common/context/AccountContext";

export function useAccountWallet() {
  const { wallet } = useWalletContext();
  if (!wallet) {
    return null;
  }
  const account = useAccountContext();
  return wallet.getAccountByName(account.name);
}
