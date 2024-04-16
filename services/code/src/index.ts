import { RawData, WebSocketServer, createWebSocketStream, WebSocket } from "ws";
import stream from "stream";

import { Project } from "./repos.js";

const requestHandler = async (headers: Headers, stream: stream.Duplex) => {
  const id = headers.get("location")!.split("/")[2];
  console.log(id);

  if (id) {
    try {
      const project = await Project.init(id);
      await project.proxy(headers, stream);
    } catch (e) {
      console.log(e);
      stream.write(JSON.stringify({ status: 500 }));
    }
  } else {
    stream.write(JSON.stringify({ status: 404 }));
  }
};

const handleFirstRequest = (ws: WebSocket) => {
  let headers: Headers | null = null

  const messageHandler = (data: RawData, isBinary: boolean) => {
    if (!isBinary) {
      const parsed = JSON.parse((data as unknown) as string);
      if (parsed.sendHeaders) {
        console.log('sendHeaders recieved')
        const stream = createWebSocketStream(ws);

        requestHandler(headers!, stream);
        ws.off("message", messageHandler);
      } else {
        console.log('Headers recieved')
        headers = new Headers(parsed)
      }
    }
  };
  ws.on("message", messageHandler);
};

const wss = new WebSocketServer({ port: parseInt(process.env.PORT!) });

wss.on("connection", (ws) => {
  ws.on("error", console.error);
  
  handleFirstRequest(ws)
});
