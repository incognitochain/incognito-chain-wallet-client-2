import moment from "moment";
import { toPRV } from "incognito-chain-web-js/build/wallet";

export const truncLongText = (text = "") =>
  `${text.substr(0, 10)}...${text.substr(-10)}`;

// formatPRVAmount formats amount for PRV when display for user (in privacy unit)
export const formatPRVAmount = amount =>
  toPRV(amount).toLocaleString(navigator.language, {
    minimumFractionDigits: 4
  });

export const formatTokenAmount = amount =>
  Number.parseInt(amount).toLocaleString();

export const formatDate = (date, formatPartern) =>
  moment(date).format(formatPartern || "DD/MM/YYYY - HH:mm:ss");
