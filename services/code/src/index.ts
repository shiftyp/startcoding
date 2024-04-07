import { WebSocketServer, createWebSocketStream } from 'ws';
import stream from 'stream'

import { Project } from "./repos.js";

const wss = new WebSocketServer( { port: parseInt(process.env.PORT!) })

wss.on('connection', ws => {
  let stream: stream.Duplex | null = null
  let headers: Headers | null = null

  ws.on('error', console.error)
  ws.on('message', (data, isBinary) => {
    if (!isBinary) {
      headers = new Headers(JSON.parse(data as unknown as string))
      stream = createWebSocketStream(ws)

      code(headers, stream)
    }
  })
})

export const code = async (headers: Headers, stream: stream.Duplex) => {
  const id = headers.get('location')!.split("/")[2];
  console.log(id);

  if (id) {
    try {
      const project = await Project.init(id)
      await project.proxy(headers, stream);
    } catch (e) {
      console.log(e);
      stream.write(500);
    }
  } else {
    stream.write(404);
  }
};

