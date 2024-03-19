import * as git from "isomorphic-git";
import {
  S3Client,
  CreateBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { v1 as UUID } from "uuid";
import { IncomingMessage, OutgoingMessage } from 'http'
// @ts-ignore
import backend from "git-http-backend";
import zlib from "zlib";
import tar from "tar";
import { spawn } from "child_process";
// @ts-ignore
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
// @ts-ignore
import streamToBlob from "stream-to-blob";
import chokidar from "chokidar"

const {
  MINIO_URL,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_REPO_BUCKET,
  REPO_STORAGE_DIRECTORY,
} = process.env;

if (!MINIO_URL) {
  throw "MINIO_URL not given";
}
if (!MINIO_ACCESS_KEY) {
  throw "MINIO_ACCESS_KEY not given";
}
if (!MINIO_SECRET_KEY) {
  throw "MINIO_SECRET_KEY not given";
}

const connectMinio = () => {
  return new S3Client({
    endpoint: `http://${MINIO_URL}:9000`,
    credentials: {
      accessKeyId: MINIO_ACCESS_KEY,
      secretAccessKey: MINIO_SECRET_KEY,
    },
    forcePathStyle: true,
    region: "local",
  });
};

const client = connectMinio();

if (!MINIO_REPO_BUCKET) {
  throw "MINIO_REPO_BUCKET not given";
}
if (!REPO_STORAGE_DIRECTORY) {
  throw "REPO_STORAGE_DIRECTORY not given or does not exist";
}

const uploadRepo = async (id: string, uuid: string) => {
  const root = path.join(REPO_STORAGE_DIRECTORY, uuid);
  const blob: Blob = await streamToBlob(
    tar.c({ gzip: true, z: true, cwd: root }, ["./"])
  );
  const command = new PutObjectCommand({
    Bucket: MINIO_REPO_BUCKET,
    Key: `${id}.tgz`,
    Body: new Uint8Array(await blob.arrayBuffer()),
  });

  client.send(command);
};

const syncRepository = async (id: string) => {
  const uuid = UUID();
  const root = path.join(REPO_STORAGE_DIRECTORY, uuid);

  try {
    await client.send(
      new CreateBucketCommand({
        Bucket: MINIO_REPO_BUCKET,
      })
    );
  } catch (e) {
    console.error(e);
  }

  if (!existsSync(root)) {
    await fs.mkdir(root);
  }

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: MINIO_REPO_BUCKET,
        Key: `${id}.tgz`,
      })
    );

    await fs.writeFile(
      `/tmp/${uuid}.tgz`,
      await response.Body!.transformToByteArray()
    );

    await tar.x({
      file: `/tmp/${uuid}.tgz`,
      C: root,
    });
  } catch (e) {
    console.error("Error with sync", e);
    try {
      await git.init({ fs, dir: root, defaultBranch: "main", bare: true });
      await uploadRepo(id, uuid);
    } catch (e) {
      console.log("Error with init", e);
      throw e;
    }
  }

  return uuid;
};

const proxy = async (id: string, uuid: string, request: IncomingMessage, response: OutgoingMessage) => {
  const translatedUrl = request.url!.replace(id, uuid)
  const REMOTE_USER = "system";
  const REMOTE_EMAIL = "system@startcoding.dev";
  const dir = path.join(REPO_STORAGE_DIRECTORY, uuid)

  console.log(await fs.lstat(dir))

  return new Promise<void>((resolve, reject) => {
    try {

      console.log(request.headers)
      const reqStream =
        request.headers["content-encoding"] == "gzip"
          ? request.pipe(zlib.createGunzip())
          : request;

      const resStream = reqStream
        .pipe(
          backend(translatedUrl, function (err: Error, service: any) {
            if (err) {
              response.end(err + "\n");
              reject();
              return;
            }

            response.setHeader("content-type", service.type);

            console.log(service.action, service.fields);
            const ps = spawn(
              service.cmd,
              service.args.concat([dir]),
              {
                env: {
                  REMOTE_USER,
                  REMOTE_EMAIL,
                  GIT_URL: translatedUrl?.slice(0, translatedUrl.indexOf(uuid)) + uuid
                }
              }
            );
            ps.stdout.pipe(service.createStream()).pipe(ps.stdin);
            
          })
        );
        

        resStream.on('data', (data: any) => {
          console.log('data')
          console.log(data)
        })
        resStream.on("exit", () => {
          console.log('exit')
          resolve();
        });
        resStream.on("error", (err: Error) => {
          console.error('error');
          reject(err);
        });

        resStream
        .pipe(response);
    } catch (e) {
      reject(e);
    }
  }).finally(() => console.log('resolve'));
};

export class Project {
  static async init(id: string) {
    console.log("init project");
    const uuid = await syncRepository(id)
    return new Project(id, uuid);
  }

  constructor(public readonly id: string, private uuid: string) {}

  private async watch() {
    for await (var info of fs.watch(path.join(REPO_STORAGE_DIRECTORY!, this.uuid))) {
      uploadRepo(this.id, this.uuid)
    }
  }

  public async proxy(request: IncomingMessage, response: OutgoingMessage) {
    console.log(`proxying request ${request.url}`);
    const promise = proxy(this.id, this.uuid!, request, response) 
  }
}
