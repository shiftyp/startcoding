import * as functionsV2 from "firebase-functions/v2";
import {WebSocketServer, createWebSocketStream} from "ws";

import {Server} from 'http'
import stream from 'stream'
import { handler } from "./code_handler.js";

let server: Server; // http.Server
const wss = new WebSocketServer({noServer: true});

wss.on('connection', ws => {
  let stream: stream.Duplex | null = null
  let headers: Headers | null = null

  ws.on('error', console.error)
  ws.on('message', (data, isBinary) => {
    if (!isBinary) {
      headers = new Headers(JSON.parse(data as unknown as string))
      stream = createWebSocketStream(ws)

      handler(headers, stream)
    }
  })
})

export const code = functionsV2.https.onRequest(
  (req, res) => {
    // @ts-expect-error
    const reqServer = req.socket.server as Server;
    if (reqServer === server) return;
    server = reqServer;

    server.on("upgrade", (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });


    // server.emit("request", req, res); // this is not sufficient
    res.setHeader("Retry-After", 0).status(503).send("Websockets now ready");
  });