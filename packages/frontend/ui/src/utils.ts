import git, { HttpClient } from "isomorphic-git";
import LightningFS from "@isomorphic-git/lightning-fs";
import { Language } from "@startcoding/types";
import asyncify from 'callback-to-async-iterator'
import { getAuth } from "firebase/auth";

const createChunkCallback = (ws: WebSocket) => async (callback: (Uint8Array) => void) => {

  const handleChunk = async (evt: MessageEvent) => {
    const buffer = Buffer.from(
      (await (evt.data as Blob).arrayBuffer()) as ArrayBuffer
    );
    callback(buffer);
  };

  ws.onmessage = handleChunk;
  ws.onclose = () => callback(null)
};

const chunkGenerator = async function*(ws: WebSocket) {
  const innerGenerator = asyncify(createChunkCallback(ws))

  let next: { value: Uint8Array | null, done: boolean}

  do {
    next = await innerGenerator.next()
    if (next.value) yield next.value
  } while (next.value)
}

const http: HttpClient = {
  request: async ({ url, method, headers, body }) => {
    const ws = new WebSocket(`wss://code-service-5yng3ystqq-uc.a.run.app`);

    ws.onopen = async () => {
      ws.send(
        JSON.stringify({
          method,
          location: url.slice(
            url.indexOf(location.host) + location.host.length
          ),
          ...headers,
        })
      );
      if (body) {
        const iterator = body as AsyncIterable<Uint8Array>;

        for await (const chunk of iterator) {
          ws.send(chunk);
        }
      }
    };

    return new Promise((resolve, reject) => {
      ws.onmessage = async (message) => {
        resolve({
          url: url,
          headers: JSON.parse(await message.data.text()) as Record<
            string,
            string
          >,
          body: chunkGenerator(ws),
          statusCode: 200,
          statusMessage: "Ok",
        });
      };
    });
  },
};

export const config = async (
  fs: LightningFS,
  userName: string,
  userEmail: string
) => {
  await git.setConfig({
    fs,
    dir: "/code",
    path: "user.name",
    value: userName,
  });
  await git.setConfig({
    fs,
    dir: "/code",
    path: "user.email",
    value: userEmail,
  });
};
export const testFile = async (fs: LightningFS, extension: "js" | "py") => {
  try {
    await fs.promises.readFile(`/code/index.${extension}`);
    return true;
  } catch (e) {
    return false;
  }
};

const rmdir = async (pfs: LightningFS["promises"], dir: string) => {
  const list = await pfs.readdir(dir);
  for (let i = 0; i < list.length; i++) {
    const filename = dir + "/" + list[i];
    const stat = await pfs.stat(filename);

    if (filename == "." || filename == "..") {
      // pass these files
    } else if (stat.isDirectory()) {
      // rmdir recursively
      await rmdir(pfs, filename);
    } else {
      // rm fiilename
      await pfs.unlink(filename);
    }
  }
  await pfs.rmdir(dir);
};

const repoUrl = (repo: string) => {
  const { hostname, protocol, port } = document.location;

  return `${protocol}//${hostname}${port ? `:${port}` : ""}/code/${repo}`;
};

export const clone = async (fs, repo: string) => {
  const pfs = fs.promises;

  const dir = "/code";

  try {
    await rmdir(pfs, dir);
  } catch (e) {
    console.log(e);
  }

  await pfs.mkdir(dir);

  await git.clone({
    fs,
    http,
    dir,
    url: repoUrl(repo),
    ref: "main"
  });

  const { displayName, email } = getAuth().currentUser || { displayName: null, email: null };
  await config(fs, displayName || "Anonymous", email || "Anonymous");

  if (!(await testFile(fs, 'js'))) {
    await commit(fs, 'javascript', '// Start Coding Here!!!', repo)
  }

  return fs;
};

export const commit = async (
  fs: LightningFS,
  language: Language,
  code: string,
  repo: string
) => {
  const filepath = `index.${language === "javascript" ? "js" : "py"}`;
  const fullPath = `/code/${filepath}`;
  
  let currentFile: Uint8Array | string | null

  try {
    currentFile = await fs.promises.readFile(fullPath);
  } catch(e) {
    currentFile = null
  }

  let currentCode: string | null

  if (currentFile instanceof Uint8Array) {
    currentCode = new TextDecoder().decode(currentFile);
  } else {
    currentCode = currentFile
  }

  if (currentCode !== code) {
    await fs.promises.writeFile(fullPath, code);

    await git.add({
      fs,
      dir: "/code",
      filepath: filepath,
    });

    await git.commit({
      fs,
      message: "Save",
      dir: "/code",
    });

    await git.push({
      fs,
      dir: "/code",
      remote: "origin",
      http,
    });
  }
};
