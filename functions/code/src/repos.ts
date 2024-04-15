import * as git from "isomorphic-git";
import { v1 as UUID } from "uuid";
// @ts-ignore
import backend from "git-http-backend";
import zlib from "zlib";
// @ts-ignore
import tar from "tar";
import { spawn } from "child_process";
import pfs from "fs/promises";
import fs from "fs";
import path from "path";
import os from "os";
import { Storage } from "@google-cloud/storage";
import stream from "stream";

const uploadRepo = async (id: string, uuid: string) => {
  const bucket = new Storage().bucket("gs://woofjs2-repos");
  const root = path.join(os.tmpdir(), uuid);
  const stream = tar.c({ gzip: true, z: true, cwd: root }, ["./"]);
  console.log('then went here')
  const file = bucket.file(`${id}.tgz`);
  console.log('then got here')

  return await new Promise((resolve, reject) => {
    const write = stream.pipe(file.createWriteStream());
    write.on("error", reject);
    write.on("finish", resolve);
  });
};

const syncRepository = async (id: string): Promise<string> => {
  const bucket = new Storage().bucket("gs://woofjs2-repos");
  const uuid = UUID();
  const root = path.join(os.tmpdir(), uuid);
  const archive = path.join(os.tmpdir(), `${uuid}.tgz`);

  if (!fs.existsSync(root)) {
    await pfs.mkdir(root);
  }

  const file = bucket.file(`${id}.tgz`);

  const [exists] = await file.exists()

  if (exists) {
    const write = file.createReadStream().pipe(fs.createWriteStream(archive));
    await new Promise<void>((resolve, reject) => {
      write.on("error", reject);
      write.on("finish", resolve);
    });

    await tar.x({
      file: archive,
      C: root,
    });

    return uuid
  } else {
    await git.init({ fs, dir: root, defaultBranch: "main" });
    await pfs.writeFile(path.join(root, "README.md"), '🐕 Woof, World! 🚀\n');
    await pfs.writeFile(path.join(root, "index.js"), '// 🐕 Start Coding Here!!! 🚀\n');
    await git.add({ fs, dir: root, filepath: "."})
    await git.commit({ fs, dir: root, message: "Initial commit 🐕" ,author: {
      name: "Lulu",
      email: "lulu@woofjs.com"
    } });
    
    await pfs.appendFile(path.join(root, '.git', 'config'), '        bare = true')

    await uploadRepo(id, path.join(uuid, '.git'));

    return await syncRepository(id)
  }
};

const proxy = (
  id: string,
  uuid: string,
  headers: Headers,
  stream: stream.Duplex
) => {
  const translatedUrl = headers.get("location")!.replace(id, uuid);
  const REMOTE_USER = "system";
  const REMOTE_EMAIL = "system@startcoding.dev";
  const dir = path.join(os.tmpdir(), uuid);

  const reqStream =
    headers.get("content-encoding") == "gzip"
      ? stream.pipe(zlib.createGunzip())
      : stream;

  const resStream = reqStream.pipe(
    backend(translatedUrl, function(err: Error, service: any) {
      if (err) {
        stream.end(err + "\n");
        return;
      }

      stream.write(JSON.stringify({ "content-type": service.type }), () => {
        const ps = spawn(service.cmd, service.args.concat([dir]), {
          env: {
            REMOTE_USER,
            REMOTE_EMAIL,
            GIT_URL: translatedUrl?.slice(0, translatedUrl.indexOf(uuid)) + uuid,
          },
        });
        ps.stdout.pipe(service.createStream()).pipe(ps.stdin);
      });
    })
  );

  resStream.pipe(stream);
};

export class Project {
  static async init(id: string) {
    console.log("init project");
    const uuid = await syncRepository(id);
    return new Project(id, uuid);
  }

  constructor(public readonly id: string, private uuid: string) {}

  public async proxy(headers: Headers, stream: stream.Duplex) {
    console.log(`proxying request ${headers.get("location")}`);
    try {
      proxy(this.id, this.uuid, headers, stream);
      stream.on("finish", () => {
        uploadRepo(this.id, this.uuid);
      });
    } catch (e) {
      console.error(e);
    }
  }
}
