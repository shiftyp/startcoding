import { BackdropDescriptor, KIND } from "@startcoding/types";
import { validate } from "../utils";

export const backdropDescriptor: BackdropDescriptor = {
  kind: "backdrop",
  url: "",
  style: "cover",
};

validate({ type: 'string', min: 1})
export const setBackdropURLImpl = (url: string) => {
  backdropDescriptor.url = url;
}

declare global {
  interface WorkerGlobalScope {
    setBackdropURL: typeof setBackdropURLImpl;
  }
}

self.setBackdropURL = setBackdropURLImpl;
