import { Core } from "@startcoding/ts-core"

export const core: Core = {
  log: (...messages) => console.log(...messages),
  callback: (cb) => setTimeout(cb, 100)
}