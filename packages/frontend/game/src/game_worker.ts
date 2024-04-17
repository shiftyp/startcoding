import {
  EventDescriptor,
  Tick
} from "@startcoding/types"
import { trigger } from "./register";
import { callTick, execute } from "./loop";
import './components'

onmessage = async (
  message: MessageEvent<[action: "trigger", descriptor: EventDescriptor] | [action: "callTick", tick: Tick] | [action: 'start', url: string]>
) => {
  const [action] = message.data;
  if (action === "trigger") {
    const [_, descriptor] = message.data;
    trigger(descriptor);
  } else if (action === "callTick") {
    const [_, tick] = message.data;
    callTick(tick);
  } else if (action === 'start') {
    const [_, url] = message.data

    try {
      await execute(url)
    } catch (e: any) {
      postMessage(['loadError', e.toString()])
      return
    }

    postMessage(['loaded'])
  }
};