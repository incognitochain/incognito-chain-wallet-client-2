import { fromEvent } from "rxjs";
import {
  map,
  debounceTime,
  switchMap,
  distinctUntilChanged,
  filter
} from "rxjs/operators";
import Account from "../../../../services/Account";
import React from "react";
import _ from "lodash";
import toastr from "toastr";

function feePerTx(fee, EstimateTxSizeInKb, GOVFeePerKbTx) {
  const result = Number(fee) / EstimateTxSizeInKb;
  if (result >= GOVFeePerKbTx) {
    return result;
  }
  return -1;
}

export function useGetFeeOnChangeAmount(
  amountInput,
  privateKey,
  state,
  dispatch
) {
  React.useEffect(() => {
    const subscription = fromEvent(amountInput, "keyup")
      .pipe(
        map(e => Number(e.target.value)),
        filter(Boolean),
        debounceTime(750),
        distinctUntilChanged(),
        switchMap(amount => {
          return Account.getEstimateFee([
            privateKey,
            {
              [state.toAddress]: parseFloat(amount) * 1000
            },
            feePerTx(state.fee, state.EstimateTxSizeInKb, state.GOVFeePerKbTx), // TODO
            1
          ]);
        })
      )
      .subscribe(response => {
        if (response.status === 200 && !_.get(response, "data.Error")) {
          const { EstimateFeeCoinPerKb, EstimateTxSizeInKb, GOVFeePerKbTx } =
            _.get(response, "data.Result", {}) || {};
          dispatch({
            type: "SET_ESTIMATE_FEE",
            payload: {
              fee: EstimateFeeCoinPerKb * EstimateTxSizeInKb,
              EstimateTxSizeInKb,
              GOVFeePerKbTx
            }
          });
        } else {
          toastr.error(
            _.get(response, "data.Error.Message", "Error on load estimate fee")
          );
        }
      }, console.error);

    return () => {
      subscription.unsubscribe();
    };
  }, [
    state.toAddress,
    state.fee,
    state.EstimateTxSizeInKb,
    state.GOVFeePerKbTx
  ]);
}
