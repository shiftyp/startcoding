import { BackdropDescriptor, KIND } from "@startcoding/types";
import { validate } from "../utils";

export const backdropDescriptor: BackdropDescriptor = {
  kind: "backdrop",
  url: "",
  style: "cover",
  repeat: 'repeat'
};

validate({ type: 'string', min: 1})
export const setBackdropURLImpl = (url: string) => {
  backdropDescriptor.url = url;
}

validate({ type: 'string', pattern: /cover|contain/})
export const setBackdropStyleImpl = (style: typeof backdropDescriptor.style) => {
  backdropDescriptor.style = style;
}

validate({ type: 'string', pattern: /repeat|no\-repeat|repeat\-x|repeat\-y/})
export const setBackdropRepeatImpl = (repeat: typeof backdropDescriptor.repeat) => {
  backdropDescriptor.repeat = repeat;
}

declare global {
  interface WorkerGlobalScope {
    setBackdropURL: typeof setBackdropURLImpl;
    setBackdropStyle: typeof setBackdropStyleImpl;
    setBackdropRepeat: typeof setBackdropRepeatImpl
  }
}

self.setBackdropURL = setBackdropURLImpl;
self.setBackdropStyle = setBackdropStyleImpl
self.setBackdropRepeat = setBackdropRepeatImpl
