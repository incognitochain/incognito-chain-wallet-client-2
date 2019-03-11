/**
 * DEPRICATED! DEPRICATED! DEPRICATED! DEPRICATED! DEPRICATED!
 * DEPRICATED! DEPRICATED! DEPRICATED! DEPRICATED! DEPRICATED!
 * DEPRICATED! DEPRICATED! DEPRICATED! DEPRICATED! DEPRICATED!
 */
import local from "./localStore";
import { APP } from "./constant";

export default class Server {
  static get() {
    const result = local.get(APP.SERVERS);
    if (result) {
      return result;
    }
    return false;
  }

  static getDefault() {
    const result = local.get(APP.SERVERS);
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
    local.save(APP.SERVERS, [
      {
        default: true,
        address: "http://localhost:9334",
        username: "",
        password: "",
        name: "Local"
      }
    ]);
  }

  static set(data) {
    local.save(APP.SERVERS, data);
  }
}
