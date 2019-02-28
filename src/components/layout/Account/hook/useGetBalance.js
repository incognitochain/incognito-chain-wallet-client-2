import React from "react";
import Account from "../../../../services/Account";
import toastr from "tapable";

export function useGetBalance({ dispatch, accountName }) {
  React.useEffect(() => {
    getBalance(dispatch, accountName);
  }, []);
}

const getBalance = async (dispatch, accountName) => {
  const result = await Account.getBalance([accountName, 1, "12345678"]);
  if (result.error) {
    toastr.error(result.message);
  } else {
    dispatch({ type: "SET_BALANCE", balance: Number(result) / 100 });
  }
};
