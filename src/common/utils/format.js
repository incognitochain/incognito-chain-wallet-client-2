export const truncLongText = (text = "") =>
  `${text.substr(0, 10)}...${text.substr(-10)}`;
