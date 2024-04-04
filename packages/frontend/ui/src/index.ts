import "./import.meta";
import LightningFS from "@isomorphic-git/lightning-fs";
import { initializeApp } from "firebase/app";
import { clone, commit, config, testFile } from "./utils";
import { Language } from "@startcoding/types";
import { renderGame } from "@startcoding/renderer";
import * as firebaseui from "firebaseui";
import { renderEditor } from "@startcoding/editor";
import { EmailAuthProvider, getAuth } from "firebase/auth";
import { Buffer } from "buffer";

// @ts-ignore
window.Buffer = Buffer;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

navigator.serviceWorker.register("/service-worker.js");

const main = () => {
  var ui = new firebaseui.auth.AuthUI(getAuth());

  const onSignIn = async () => {
    const { pathname } = window.location;
    const repoId = pathname.substring(pathname.lastIndexOf("/") + 1);
    const fs = new LightningFS(repoId);
    const { displayName, email } = getAuth().currentUser!;
    await clone(fs, repoId);
    await config(fs, displayName || "Anonymous", email || "Anonymous");
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

    let game: Awaited<ReturnType<typeof renderGame>> | null = null;

    document.getElementsByTagName("main")[0]!.style.display = "block";
    const play = document.getElementById("play")!;
    play.style.visibility = "visible";
    play.addEventListener("click", async () => {
      game = await renderGame({
        language,
        container: document.getElementById("root")!,
      });
      await game.reload(code);
      document.getElementById("play")!.style.display = "none";
    });

    const save = document.getElementById("save")!;
    save.style.visibility = "visible";
    save.addEventListener("click", async () => {
      await commit(fs, language, code, repoId);
      if (game) await game.reload(code);
    });

    renderEditor({
      container: document.getElementById("editor")!,
      language,
      code,
      updateCode,
    });
  };

  ui.start("#firebaseui-auth-container", {
    callbacks: {
      signInSuccessWithAuthResult: () => {
        onSignIn();
        return false;
      },
    },
    signInOptions: [
      {
        provider: EmailAuthProvider.PROVIDER_ID,
        requireDisplayName: true,
      },
    ],
  });
};
main();
