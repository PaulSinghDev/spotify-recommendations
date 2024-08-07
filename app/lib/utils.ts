import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function batchArray<T = unknown>(array: T[], size = 50) {
  const output: T[][] = [];
  const max = Math.ceil(array.length / size);

  for (let count = 0; count < max; count++) {
    output.push(array.slice(count * size, (count + 1) * size));
  }

  return output;
}
