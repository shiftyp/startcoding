import { clone, run } from "@startcoding/vm"
import { Buffer } from 'buffer'
import { setup } from "@startcoding/renderer"

// @ts-ignore
window.Buffer = Buffer;

const main = async () => {
  const {
    renderGame,
    register,
    listen,
    setTrigger,
    setCallTick
  } = setup()

  await run({ fs: await clone(), register, listen, setTrigger, setCallTick })
  await renderGame(document.getElementById('root')!)
}

main()