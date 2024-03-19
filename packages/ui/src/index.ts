import { clone, run } from "@startcoding/browser-core"
import { Buffer } from 'buffer'

// @ts-ignore
window.Buffer = Buffer;

const main = async () => {
  await run(await clone())
}

main()