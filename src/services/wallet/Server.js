import { CONSTANT_KEYS, CONSTANT_CONFIGS } from '@src/constants';
import local from './localStore';

export default class Server {
  static get() {
    const result = local.get(CONSTANT_KEYS.SERVERS);
    if (result) {
      return result;
    }
    return false;
  }

  static getDefault() {
    const result = local.get(CONSTANT_KEYS.SERVERS);
    if (result && result.length) {
      for (let s of result) {
        if (s.default) {
          return s;
        }
      }
    }

    return false;
  }

  static setDefault() {
    local.save(CONSTANT_KEYS.SERVERS, CONSTANT_CONFIGS.DEFAULT_LIST_SERVER);
  }

  static set(data) {
    local.save(CONSTANT_KEYS.SERVERS, data);
  }
}
