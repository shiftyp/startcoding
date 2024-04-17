import { z } from "zod";
import { addTick } from "../loop";

export const After = z.function()
  .args(
    z.number().min(0),
    z.union([z.literal('seconds'), z.literal('milliseconds')]),
    z.function()
  )

export const after = After.implement((
  duration: number,
  unit: "seconds" | "milliseconds",
  callback: () => void
) => {
  let last = 0;

  const remove = addTick(({ timing: { deltaTime } }) => {
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
      remove()
      last = 0;
    }
  }, 1);
});

declare global {
  interface WorkerGlobalScope {
    after: typeof after
  }
}

self.after = after