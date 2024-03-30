import { clone, testFile, commit, config } from "./utils";
import { Buffer } from "buffer";
import { renderGame } from "@startcoding/renderer";
import { renderEditor } from "@startcoding/editor";
import { Language } from "@startcoding/types";

// @ts-ignore
window.Buffer = Buffer;

const main = async () => {
  const { pathname } = window.location;
  const repoId = pathname.substring(pathname.lastIndexOf("/") + 1);
  const userName = "Ryan";
  const userEmail = "system@startcoding.dev";
  const fs = await clone(repoId);
  await config(fs, userName, userEmail);
  let file: Uint8Array;
  let language: Language;

  if (await testFile(fs, "js")) {
    language = "javascript";
    file = (await fs.promises.readFile("/code/index.js")) as Uint8Array;
  } else if (await testFile(fs, "py")) {
    language = "python";
    file = (await fs.promises.readFile("/code/index.py")) as Uint8Array;
  } else {
    throw "No valid index in repo";
  }

  let code = new TextDecoder().decode(file);

  const updateCode = async (newCode: string) => {
    code = newCode;
  };

  let game: ReturnType<typeof renderGame> | null = null;

  document.getElementById("play")!.addEventListener("click", async () => {
    const [compiled] = await (await import("@startcoding/compiler")).compileIndex(code);
    //const [compiled] = await (await import('@startcoding/compiler')).compileDebug(code)
    //console.log(compiled)
    game = renderGame({
      language,
      container: document.getElementById("root")!,
    });
    game.reload(compiled);
    document.getElementById("play")!.style.display = "none";
  });

  document.getElementById("save")?.addEventListener("click", async () => {
    await commit(fs, language, code, repoId);
    const [compiled] = await (await import("@startcoding/compiler")).compileIndex(code);
    if (game) game.reload(compiled);
  });

  renderEditor({
    container: document.getElementById("editor")!,
    language,
    code,
    updateCode,
  });
};

main();
