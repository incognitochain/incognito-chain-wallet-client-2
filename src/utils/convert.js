import { CONSTANT_COMMONS } from '@src/constants';

export default {
  toMiliConstant(amount = throw new Error('Amount is required!')) { return Number(amount * CONSTANT_COMMONS.MILICONSTANT_UNIT) || 0; },
  toConstant(amount = throw new Error('Amount is required!')) { return Number(amount / CONSTANT_COMMONS.MILICONSTANT_UNIT) || 0; },
};