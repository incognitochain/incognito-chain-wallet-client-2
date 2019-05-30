import moment from 'moment';
import { CONSTANT_COMMONS } from '@src/constants';

const AmountFormat = new Intl.NumberFormat('en-US');
const amount = (amount = throw new Error('Amount is required!'), tokenSymbol) => {
  const decision_rate = CONSTANT_COMMONS.DECISION_RATE[tokenSymbol] || 1;
  const _amount = amount/decision_rate;
  return AmountFormat.format(Math.max(_amount), 0);
};
const formatDateTime = (dateTime, formatPartern) => moment(dateTime).format(formatPartern || 'DD/MM/YYYY - HH:mm:ss');
const toMiliSecond = (second) => second * 1000;

export default {
  amount,
  formatDateTime,
  toMiliSecond
};
