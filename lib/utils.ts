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

export function getBoundingBox(latitude: number, longitude: number, radius = 0.1): google.maps.LatLngBoundsLiteral {
  // Create a bounding box with sides ~10km (default) away from the coordinates
  return {
    north: latitude + radius,
    south: latitude - radius,
    east: longitude + radius,
    west: longitude - radius,
  };
}
