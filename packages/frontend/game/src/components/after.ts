import { addTick } from "../loop";
import { validate } from "../utils"

export const afterImpl = (
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
}

const after = validate(
  { type: 'number', min: 0},
  { type: 'string', pattern: /second[s]?|millisecond[s]?/ },
  { type: 'function' }
)(afterImpl)

declare global {
  interface WorkerGlobalScope {
    after: typeof after
  }
}

self.after = after