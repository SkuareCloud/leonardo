import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function waitUntil(condition: () => boolean, timeout: number = 20_000, retryIntervalMs: number = 100) {
  const startTime = Date.now();

  return new Promise<void>((resolve, reject) => {
    const checkCondition = () => {
      if (condition()) {
        resolve();
        return;
      }

      if (Date.now() - startTime >= timeout) {
        reject(new Error(`Condition not met after ${timeout}ms`));
        return;
      }

      setTimeout(checkCondition, retryIntervalMs);
    };

    checkCondition();
  });
}
