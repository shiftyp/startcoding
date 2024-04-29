import * as functionsV2 from "firebase-functions/v2";
import {WebSocketServer, createWebSocketStream, WebSocket, RawData} from "ws";

import {Server} from 'http'
import { handler } from "./code_handler.js";
import http from "http";

let server: Server; // http.Server
const wss = new WebSocketServer({noServer: true});

const handleHandshake = (ws: WebSocket) => {
  const messageHandler = (data: RawData, isBinary: boolean) => {
    if (!isBinary) {
      const parsed = JSON.parse((data as unknown) as string);
      const headers = new Headers(parsed)
      handler(headers, createWebSocketStream(ws))
    }
  };
  ws.once("message", messageHandler);
};

wss.on('connection', ws => {
  ws.on('error', console.error)
  handleHandshake(ws)
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
    res.send()
  });