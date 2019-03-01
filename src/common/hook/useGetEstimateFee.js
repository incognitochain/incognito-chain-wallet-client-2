import { fromEvent, combineLatest } from "rxjs";
import {
  map,
  debounceTime,
  switchMap,
  distinctUntilChanged,
  filter,
  startWith
} from "rxjs/operators";
import Account from "services/Account";
import React from "react";
import toastr from "toastr";
import _ from "lodash";
import { useAccountContext } from "common/context/AccountContext";

function feePerTx(fee, EstimateTxSizeInKb) {
  const result = Number(fee) / EstimateTxSizeInKb;
  return result || -1;
}

export function useGetEstimateFee({
  toAddressInput,
  amountInput,
  fee,
  EstimateTxSizeInKb,
  GOVFeePerKbTx,
  // getRequestTokenObject,
  onGotEstimateFee
}) {
  const account = useAccountContext();

  const privateKey = account.PrivateKey;

  React.useEffect(() => {
    console.log("useGetEstmiateFee", toAddressInput, amountInput);
    if (!toAddressInput || !amountInput) {
      return;
    }
    const toAddressObservable = fromEvent(toAddressInput, "keyup").pipe(
      map(e => e.target.value),
      filter(Boolean),
      debounceTime(750),
      distinctUntilChanged(),
      startWith("")
    );

    const amountObservable = fromEvent(amountInput, "keyup").pipe(
      map(e => Number(e.target.value)),
      filter(Boolean),
      debounceTime(750),
      distinctUntilChanged(),
      startWith(0)
    );

    const subscription = combineLatest(toAddressObservable, amountObservable)
      .pipe(
        filter(([toAddress, amount]) => toAddress && amount),
        switchMap(([toAddress, amount]) => {
          console.log("switchmap", toAddress, amount);
          return Account.getEstimateFee([
            privateKey,
            {
              [toAddress]: parseFloat(amount) * 1000
            },
            feePerTx(fee, EstimateTxSizeInKb),
            1
            // ...(getRequestTokenObject ? [getRequestTokenObject()] : [])
          ]);
        })
      )
      .subscribe(response => {
        if (response.status === 200 && !_.get(response, "data.Error")) {
          const { EstimateFeeCoinPerKb, EstimateTxSizeInKb, GOVFeePerKbTx } =
            _.get(response, "data.Result", {}) || {};
          onGotEstimateFee({
            estimateFee: EstimateFeeCoinPerKb * EstimateTxSizeInKb,
            EstimateTxSizeInKb,
            GOVFeePerKbTx
          });
        } else {
          toastr.error(
            _.get(response, "data.Error.Message", "Error on load estimate fee")
          );
        }
      }, console.error);

    return () => {
      subscription.unsubscribe();
      console.log("\t unsubscribed");
    };
  }, [
    fee,
    EstimateTxSizeInKb,
    GOVFeePerKbTx,
    toAddressInput,
    amountInput
    // getRequestTokenObject
  ]);
}
