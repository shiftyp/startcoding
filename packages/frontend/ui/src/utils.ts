import git, { HttpClient } from "isomorphic-git";
import LightningFS from "@isomorphic-git/lightning-fs";
import asyncify from "callback-to-async-iterator";
import { getAuth } from "firebase/auth";
import './import.meta'

const createChunkCallback = (ws: WebSocket) => async (
  callback: (Uint8Array) => void
) => {
  const handleChunk = async (evt: MessageEvent) => {
    const buffer = Buffer.from(
      (await (evt.data as Blob).arrayBuffer()) as ArrayBuffer
    );
    callback(buffer);
  };

  ws.onmessage = handleChunk;
  ws.onclose = () => callback(null);
};

const chunkGenerator = async function*(ws: WebSocket) {
  const innerGenerator = asyncify(createChunkCallback(ws));

  let next: { value: Uint8Array | null; done: boolean };

  do {
    next = await innerGenerator.next();
    if (next.value) yield next.value;
  } while (next.value);
};

let retryCount = 0
const maxRetries = 10

const http: HttpClient = {
  request: async ({ url, method, headers, body }) => {
    return new Promise((resolve, reject) => {
      const errorHandler = (err: Event) => {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying connection attempt ${retryCount}...`);
          const response = http.request({ url, method, headers, body});
          resolve(response)
        } else {
          console.error('websockets error:', err);
        }
      }

      let ws: WebSocket

      try {
        ws = new WebSocket(`wss://${import.meta.env.VITE_FIREBASE_CODE_FUNCTION}`);
      } catch (e) {
        // For Older Browsers
        return errorHandler(e)
      }
      
      // For newer browsers
      ws.addEventListener('error', errorHandler)

      const onMessage = async (message) => {
        resolve({
          url: url,
          headers: JSON.parse(await message.data.text()) as Record<
            string,
            string
          >,
          body: chunkGenerator(ws),
          statusCode: 200,
          statusMessage: "Ok",
        })
        ws.removeEventListener('message', onMessage)
      }

      ws.onopen = async () => {
        retryCount = 0
        ws.addEventListener('message', onMessage);
        ws.send(
          JSON.stringify({
            method,
            location: url.slice(
              url.indexOf(location.host) + location.host.length
            ),
            ...headers,
          })
        );

        ws.send(JSON.stringify({ sendHeaders: true }))

        if (body) {
          const iterator = body as AsyncIterable<Uint8Array>;

          for await (const chunk of iterator) {
            ws.send(chunk);
          }
        }
      };
    })
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
    url: repoUrl(repo)
  });

  const branches = await git.listBranches({
    fs,
    dir
  })

  if (!branches.includes("main")) {
    git.branch({
      fs,
      dir,
      ref: 'main',
      checkout: true
    })
  } else {
    await git.checkout({
      fs,
      dir,
      ref: 'main'
    })
  }

  const { displayName, email } = getAuth().currentUser || {
    displayName: null,
    email: null,
  };
  await config(fs, displayName || "Anonymous", email || "Anonymous");

  return fs;
};

export const commit = async (
  fs: LightningFS,
  filepath: 'index.js' | 'README.md',
  code: string,
  repo: string
) => {
  const fullPath = `/code/${filepath}`;

  let currentFile: Uint8Array | string | null;

  try {
    currentFile = await fs.promises.readFile(fullPath);
  } catch (e) {
    currentFile = null;
  }

  let currentCode: string | null;

  if (currentFile instanceof Uint8Array) {
    currentCode = new TextDecoder().decode(currentFile);
  } else {
    currentCode = currentFile;
  }

  if (currentCode !== code) {
    await fs.promises.writeFile(fullPath, code);

    await git.add({
      fs,
      dir: "/code",
      filepath: filepath
    });

    await git.commit({
      fs,
      message: "Save",
      dir: "/code",
      ref: "main",
    });

    await git.push({
      fs,
      dir: "/code",
      remote: "origin",
      http,
      ref: "main",
    });
  }
};
