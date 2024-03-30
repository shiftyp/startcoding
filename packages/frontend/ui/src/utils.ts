import http from "isomorphic-git/http/web";
import git from "isomorphic-git";
import LightningFS from "@isomorphic-git/lightning-fs";
import { Language } from "@startcoding/types";

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

var rmdir = async (pfs: LightningFS["promises"], dir: string) => {
  var list = await pfs.readdir(dir);
  for (var i = 0; i < list.length; i++) {
    var filename = dir + "/" + list[i];
    var stat = await pfs.stat(filename);

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

export const clone = async (repo: string) => {
  //@ts-ignore
  const fs = new LightningFS("fs");
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
    ref: "main",
  });

  return fs;
};

export const commit = async (
  fs: LightningFS,
  language: Language,
  code: string,
  repo: string
) => {
  const filepath = `index.${language === "javascript" ? "js" : "py"}`;
  const fullPath = `/code/${filepath}`
  const current = await fs.promises.readFile(fullPath);

  if (current !== code) {
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
