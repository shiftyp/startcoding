import { KIND } from "@startcoding/types";
import { z } from "zod";

export const backdropDescriptor = {
  [KIND]: "backdrop",
  url: "",
  style: "cover",
};

const SetBackdropUrlSchema = z.function().args(z.string());

export const setBackdropURLImpl = SetBackdropUrlSchema.implement((url: string) => {
  backdropDescriptor.url = url;
});

declare global {
  interface WorkerGlobalScope {
    setBackdropURL: typeof setBackdropURLImpl;
  }
}

self.setBackdropURL = setBackdropURLImpl;
