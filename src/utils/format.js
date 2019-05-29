import convert from '@src/utils/convert';
import moment from 'moment';

const AmountConstantFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const AmountMiliConstantFormat = new Intl.NumberFormat('en-US');

const AmountTokenFormat = new Intl.NumberFormat('en-US');

const amountMiliConstant = (amount = throw new Error('Amount is required!')) => AmountMiliConstantFormat.format(amount);
const amountConstant = (amount = throw new Error('Amount is required!')) => AmountConstantFormat.format(convert.toConstant(amount));
const amountToken = (amount = throw new Error('Amount is required!')) => AmountTokenFormat.format(Number.parseInt(amount) || 0);

const formatDateTime = (dateTime, formatPartern) => moment(dateTime).format(formatPartern || 'DD/MM/YYYY - HH:mm:ss');
const toMiliSecond = (second) => second * 1000;

export default {
  amountMiliConstant,
  amountConstant,
  amountToken,
  formatDateTime,
  toMiliSecond
};
