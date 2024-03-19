import { clone, run } from "@startcoding/browser-core"
import { Buffer } from 'buffer'
import { render } from "@startcoding/renderer"

// @ts-ignore
window.Buffer = Buffer;

const main = async () => {
  await run(await clone())
  await render()
}

main()