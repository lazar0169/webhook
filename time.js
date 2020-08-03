class Time {
  /**
   * @param format
   * @param time
   * @param UTC
   * @return {string}
   */
  static get(format = 'DD-MM-YYYY_h-m', time = Date.now(), UTC = true) {
    const dateObject = new Date(time);
    const date = (UTC
      ? dateObject.getUTCDate()
      : dateObject.getDate()
    ).toString();
    const month = (UTC
      ? dateObject.getUTCMonth() + 1
      : dateObject.getMonth()
    ).toString();
    const year = (UTC
      ? dateObject.getUTCFullYear()
      : dateObject.getFullYear()
    ).toString();
    const hours = (UTC
      ? dateObject.getUTCHours()
      : dateObject.getHours()
    ).toString();
    const min = (UTC
      ? dateObject.getUTCMinutes()
      : dateObject.getMinutes()
    ).toString();
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', date)
      .replace('h', hours)
      .replace('m', min);
  }
}

export default Time;
