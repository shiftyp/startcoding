import { z } from "zod";
import { addTick } from "../loop";

export const Every = z.function()
  .args(
    z.number().min(0),
    z.union([z.literal('seconds'), z.literal('milliseconds')]),
    z.function()
  )

export const every = Every.implement((
  duration: number,
  unit: "seconds" | "milliseconds",
  callback: () => void
) => {
  let last = 0;

  addTick(({ timing: { deltaTime } }) => {
    last += deltaTime;
    let scale = 1;

    switch (unit) {
      case "seconds":
        scale = 1000;
        break;
      case "milliseconds":
        scale = 1;
        break;
    }

    if (last / scale >= duration) {
      callback();
      last = 0;
    }
  }, 1);
});

declare global {
  interface WorkerGlobalScope {
    every: typeof every
  }
}

self.every = every