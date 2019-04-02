import React from "react";
import { useAccountContext } from "../../common/context/AccountContext";
import { useWalletContext } from "../../common/context/WalletContext";
import { useAppContext } from "../../common/context/AppContext";
import { useAccountListContext } from "../../common/context/AccountListContext";
import { Subject } from "rxjs";
import { debounceTime, switchMap } from "rxjs/operators";
import {
  getAccountBalance,
  saveAccountBalance
} from "../../services/CacheAccountBalanceService";

function loadBalance(wallet, accountName) {
  let balance = getAccountBalance(accountName);
  if (balance == -1) {
    return wallet
      .getAccountByName(accountName)
      .getBalance()
      .then(balance => {
        saveAccountBalance(balance, accountName);
        return [accountName, balance];
      });
  } else {
    return new Promise(resolve =>
      setTimeout(resolve([accountName, balance]), 1)
    );
  }
}

export const HeaderSelectedAccount = () => {
  const account = useAccountContext();
  const { appDispatch } = useAppContext();
  const accounts = useAccountListContext();
  const { wallet } = useWalletContext();

  const balanceSubjectRef = React.useRef();

  React.useEffect(() => {
    if (wallet) {
      const subject = new Subject();
      subject
        .pipe(
          debounceTime(720),
          switchMap(accountName => {
            return loadBalance(wallet, accountName);
          })
        )
        .subscribe(([accountName, balance]) => {
          appDispatch({
            type: "SET_ACCOUNT_BALANCE",
            accountName,
            balance
          });
        });
      balanceSubjectRef.current = subject;

      return () => {
        subject.unsubscribe();
      };
    }
  }, [wallet]);

  React.useEffect(() => {
    if (account.name && balanceSubjectRef.current) {
      triggerLoadBalance(account.name);
    }
  }, [account.name]);

  function triggerLoadBalance(accountName) {
    const sub = balanceSubjectRef && balanceSubjectRef.current;
    sub && sub.next(accountName);
  }

  const balance = (
    accounts.find(({ name }) => name === account.name) || { value: "..." }
  ).value;

  React.useEffect(() => {
    if (balance === -1) {
      triggerLoadBalance(account.name);
    }
  }, [balance]);

  return (
    <div className="selectedAccount">
      <span className="selectedAccountName">{account.name}</span>
      {/*({renderValue(balance)} CONST)*/}
    </div>
  );
};
