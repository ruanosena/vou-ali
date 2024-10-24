import { Endereco } from "@/types";
import { Prisma } from "@prisma/client";
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

export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

type ToNumberIfExtends<K, E> = K extends E ? number : K;
/** @link https://stackoverflow.com/a/73173094 */
type DecimalConverter<T extends Record<PropertyKey, unknown>> = {
  [key in keyof T]: ToNumberIfExtends<T[key], Prisma.Decimal>;
};

export function transformEndereco<
  T extends {
    lat: Prisma.Decimal;
    lng: Prisma.Decimal;
    norte: Prisma.Decimal | null;
    sul: Prisma.Decimal | null;
    leste: Prisma.Decimal | null;
    oeste: Prisma.Decimal | null;
  },
>(endereco: T) {
  return {
    ...endereco,
    lat: endereco.lat.toNumber(),
    lng: endereco.lng.toNumber(),
    norte: endereco.norte?.toNumber(),
    sul: endereco.sul?.toNumber(),
    leste: endereco.leste?.toNumber(),
    oeste: endereco.oeste?.toNumber(),
  } as DecimalConverter<T>;
}

export function transformLocal<
  T extends {
    lat: Prisma.Decimal;
    lng: Prisma.Decimal;
  },
>(local: T) {
  return {
    ...local,
    lat: local.lat.toNumber(),
    lng: local.lng.toNumber(),
  } as DecimalConverter<T>;
}

export function getEnderecoBounds(endereco: Endereco): google.maps.LatLngBoundsLiteral | undefined {
  return endereco?.norte
    ? {
        north: endereco.norte,
        east: endereco.leste!,
        south: endereco.sul!,
        west: endereco.oeste!,
      }
    : undefined;
}

export function formatDistancia(distancia: number) {
  return `~${distancia > 1 ? (distancia > 100 ? distancia.toFixed(0) : distancia.toFixed(1)) : distancia.toFixed(2)}km`;
}
