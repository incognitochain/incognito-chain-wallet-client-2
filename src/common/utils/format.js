import moment from "moment";

export const truncLongText = (text = "") =>
  `${text.substr(0, 10)}...${text.substr(-10)}`;

export const formatConstantBalance = balance =>
  (Number(balance) / 100).toLocaleString(navigator.language, {
    minimumFractionDigits: 2
  });

export const formatTokenAmount = amount =>
  Number.parseInt(amount).toLocaleString();

export const formatDate = (date, formatPartern) =>
  moment(date).format(formatPartern || "DD/MM/YYYY - HH:mm:ss");
