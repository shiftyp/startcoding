import * as git from "isomorphic-git";
import * as Minio from "minio";
import { v1 as UUID } from "uuid";
import { diff_match_patch } from "diff-match-patch";
import zlib from "zlib";
import tar from "tar";
import fs from "fs/promises";
import path from "path";

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
  return new Minio.Client({
    endPoint: MINIO_URL,
    port: 9000,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
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
  await client.putObject(
    MINIO_REPO_BUCKET,
    `${id}.tgz`,
    tar.c({ gzip: true }, [path.join(REPO_STORAGE_DIRECTORY, uuid)])
  );
};

const syncRepository = async (id: string) => {
  const uuid = UUID();
  const root = path.join(REPO_STORAGE_DIRECTORY, uuid);

  if (!(await client.bucketExists(MINIO_REPO_BUCKET))) {
    await client.makeBucket(MINIO_REPO_BUCKET);
  }

  await fs.mkdir(root);

  try {
    await new Promise<void>(async (resolve, reject) => {
      const operations: Promise<void>[] = [];

      (await client.getObject(MINIO_REPO_BUCKET, `${id}.tar.gz`))
        .pipe(zlib.createGunzip())
        .pipe(tar.t())
        .on("entry", (entry: tar.ReadEntry) =>
          operations.push(
            (async () => {
              const dirname = path.join(root, path.dirname(entry.path));
              const filename = path.basename(entry.path);
              if (!(await fs.opendir(dirname))) {
                await fs.mkdir(dirname, { recursive: true });
              }
              await fs.writeFile(
                path.join(dirname, filename),
                entry.read(entry.bufferLength)
              );
            })()
          )
        )
        .on("close", () => {
          Promise.all(operations)
            .catch(() => reject())
            .then(() => resolve());
        });
    });
  } catch (e) {
    await git.init({ fs, dir: root, defaultBranch: "main" });
  }

  return uuid;
};

const applyPatch = async (uuid: string, patch: Record<string, string>) => {
  const d = new diff_match_patch();

  await Promise.all(
    Object.keys(patch).map(async (key) => {
      const file = path.join(REPO_STORAGE_DIRECTORY, uuid, key);

      const current = await fs
        .readFile(file)
        .then((buffer) => buffer.toString("utf-8"));

      await fs.writeFile(
        file,
        d.patch_apply(d.patch_fromText(patch[key]), current)[0],
        "utf8"
      );
    })
  );
};

export class Project {
  private init: Promise<string>;
  private uuid: string | null = null;

  constructor(public readonly id: string) {
    this.init = syncRepository(id).then((uuid) => (this.uuid = uuid));
  }

  private async getUUID() {
    if (this.uuid !== null) {
      return this.uuid;
    } else {
      return await this.init;
    }
  }


  public async save(patch: Record<string, string>) {
    return await applyPatch(await this.getUUID(), patch);
  }

  public async upload() {
    uploadRepo(this.id, await this.getUUID());
  }
}
