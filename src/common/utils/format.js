import moment from "moment";
import { convertConstantBalance } from "./convert";

export const truncLongText = (text = "") =>
  `${text.substr(0, 10)}...${text.substr(-10)}`;

export const formatConstantBalance = balance =>
  convertConstantBalance(balance).toLocaleString(navigator.language, {
    minimumFractionDigits: 2
  });

export const formatTokenAmount = amount =>
  Number.parseInt(amount).toLocaleString();

export const formatAmount = amount =>
  Number.parseInt(amount).toLocaleString(navigator.language, {
    minimumFractionDigits: 2
  });

export const formatDate = (date, formatPartern) =>
  moment(date).format(formatPartern || "DD/MM/YYYY - HH:mm:ss");
