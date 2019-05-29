class Schedule {
  /**
   * 
   * @param {Array} accounts list of account
   * @param {Function} getBalance method to reload balance account
   * @param {number} timeout  milisecond, default 300000 ~ 5 mins
   */
  static reloadAllAccountBalance({ accounts, getBalance, timeout = (5 * 60 * 1000) } = {}) {
    const timer = null;
    const get = (account) => new Promise(r => {
      setTimeout(async () => {
        await getBalance(account);
        r();
      }, 1000);
    });

    const reload = async () => {
      for (const account of accounts) {
        await get(account);
      }
    };

    // first run
    reload();

    return (function reloadTimer(timer) {
      timer = setInterval(reload, timeout);

      return function unsubscribe() {
        clearInterval(timer);
      };
    })(timer);
  }
}

export default Schedule;