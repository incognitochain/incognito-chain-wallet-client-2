import type from '@src/redux/types/modal';
import { uniqueId } from 'lodash';

export const openModal = ({ id, title, component }) => dispatch => {
  id = id ?? uniqueId('modal-id-');
  dispatch({
    type: type.OPEN,
    data: { id, component, title }
  });

  return id;
};

export const closeModal = (id) => ({
  type: type.CLOSE,
  data: id
});