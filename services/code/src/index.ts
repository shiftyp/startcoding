import Koa, { Context } from "koa";
import { Project } from "@startcoding/project";
import fs from "fs";
import express from "express";
import http, { IncomingMessage, OutgoingMessage } from "http";
import { SecureVersion } from "tls";

// var privateKey = fs.readFileSync("/app/data/certificates/server.key");
// var certificate = fs.readFileSync("/app/data/certificates/server.crt");

// var credentials = {
//   key: privateKey,
//   cert: certificate,
//   minVersion: "TLSv1.3" as SecureVersion,
//   maxVersion: "TLSv1.3" as SecureVersion,
// } as const;

export const git = async (req: IncomingMessage, res:OutgoingMessage) => {
  const id = req.url!.split('/')[1]
  console.log(id);

  if (id) {
    const project = await Project.init(id)

    try {
      await project.proxy(req, res);
    } catch (e) {
      console.log(e);
      res.write(500)
    }
  } else {
    console.log(`${id} Not found`)
    res.write(404);
  }
};

const server = http
  .createServer(git)
  .on("checkContinue", (req, res) => {
    server.emit("request", req, res);
  })
  .listen(8081, () => {
    console.log('listening on 8081')
  });
