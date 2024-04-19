import Validator, { ValidationSchema } from "fastest-validator";
import { addTick } from "../loop";
import { validate } from "../utils";


export const everyImpl = (
  duration: number,
  unit: "seconds" | "second" | "milliseconds" | "millisecond",
  callback: () => void
) => {
  let last = 0;

  addTick(({ timing: { deltaTime } }) => {
    last += deltaTime;
    let scale = 1;

    switch (unit) {
      case "seconds":
      case "second":
        scale = 1000;
        break;
      case "milliseconds":
      case "millisecond":
        scale = 1;
        break;
    }

    if (last / scale >= duration) {
      callback();
      last = 0;
    }
  }, 1);
}

const every = validate(
  { type: 'number', min: 0 },
  { type: 'string', pattern: /second[s]?|millisecond[s]?/ },
  { type: 'function' }
)(everyImpl)

declare global {
  interface WorkerGlobalScope {
    every: typeof every
  }
}

self.every = every