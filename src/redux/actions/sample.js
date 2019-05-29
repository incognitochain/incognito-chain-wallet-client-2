import type from '@src/redux/types/sample';

export const doAction1 = () => ({
  type: type.ACTION_1,
  data: 10
});

export const doAction2 = () => ({
  type: type.ACTION_2,
  data: 20
});