export class Timer {
  active: boolean;
  timeout: NodeJS.Timeout;
  /**
   * @param {Function} callback
   * @param {number | undefined} interval
   *  */
  constructor(callback: Function, interval?: number) {
    this.active = true;
    this.timeout = setTimeout(() => {
      callback();
      this.active = false;
    }, interval);
  }
  clear() {
    clearTimeout(this.timeout);
    this.active = false;
  }
}
