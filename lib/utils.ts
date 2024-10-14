import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
