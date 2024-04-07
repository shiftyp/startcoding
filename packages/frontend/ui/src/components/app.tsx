import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";
import { clone, commit, config, testFile } from "../utils";
import { Language } from "@startcoding/types";
import { renderGame } from "@startcoding/renderer";
import * as firebaseui from "firebaseui";
import { CodeEditor } from "@startcoding/editor";
import { EmailAuthProvider, getAuth } from "firebase/auth";
import LightningFS from "@isomorphic-git/lightning-fs";
import Skeleton from "@mui/joy/Skeleton";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Stack from "@mui/joy/Stack";
import Grid from "@mui/joy/Grid";
import Button from "@mui/joy/Button";
import Sheet from "@mui/joy/Sheet";
import Accordion from "@mui/joy/Accordion";
import AccordionGroup from "@mui/joy/AccordionGroup";
import AccordionSummary from "@mui/joy/AccordionSummary";
import AccordionDetails from "@mui/joy/AccordionDetails";
import Divider from "@mui/joy/Divider";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import logoUrl from "../images/logowhite.png";

const correctionMatrices = {
  None: [
    [1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Protanopia: [
    [0.567, 0.433, 0, 0, 0],
    [0.558, 0.442, 0, 0, 0],
    [0, 0.242, 0.758, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Protanomaly: [
    [0.817, 0.183, 0, 0, 0],
    [0.333, 0.667, 0, 0, 0],
    [0, 0.125, 0.875, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Deuteranopia: [
    [0.625, 0.375, 0, 0, 0],
    [0.7, 0.3, 0, 0, 0],
    [0, 0.3, 0.7, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Deuteranomaly: [
    [0.8, 0.2, 0, 0, 0],
    [0.258, 0.742, 0, 0, 0],
    [0, 0.142, 0.858, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Tritanopia: [
    [0.95, 0.05, 0, 0, 0],
    [0, 0.433, 0.567, 0, 0],
    [0, 0.475, 0.525, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Tritanomaly: [
    [0.967, 0.033, 0, 0, 0],
    [0, 0.733, 0.267, 0, 0],
    [0, 0.183, 0.817, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Achromatopsia: [
    [0.299, 0.587, 0.114, 0, 0],
    [0.299, 0.587, 0.114, 0, 0],
    [0.299, 0.587, 0.114, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Achromatomaly: [
    [0.618, 0.32, 0.062, 0, 0],
    [0.163, 0.775, 0.062, 0, 0],
    [0.163, 0.32, 0.516, 0, 0],
    [0, 0, 0, 1, 0]
  ],
};

export const App = () => {
  const ui = useMemo(() => new firebaseui.auth.AuthUI(getAuth()), []);
  const [signedIn, setSignedIn] = useState(!!getAuth().currentUser);
  const [currentUser, setCurrentUser] = useState(getAuth().currentUser);
  const [loaded, setLoaded] = useState(false);
  const [editorDrawer, setShowEditorDrawer] = useState<
    "documentation" | "accessibility" | false
  >(false);
  const [code, setCode] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const [editorWidth, setEditorWidth] = useState(600);
  const [game, setGame] = useState<Awaited<
    ReturnType<typeof renderGame>
  > | null>(null);
  const [repoId, setRepoId] = useState(
    window.location.pathname.substring(
      window.location.pathname.lastIndexOf("/") + 1
    )
  );
  const [fs, setFs] = useState(() => new LightningFS(repoId));

  const [colorBlindCorrection, setColorBlindCorrection] = useState<
    Parameters<Awaited<ReturnType<typeof renderGame>>["setColorCorrection"]>[0]
  >("None");

  const loadCode = useCallback(async () => {
    await clone(fs, repoId);
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

    setCode(new TextDecoder().decode(file));
  }, []);

  useEffect(() => {
    if (signedIn) {
      loadCode();
    }
  }, [signedIn]);

  useEffect(() => {
    if (!signedIn) {
      ui.start("#firebaseui-auth-container", {
        callbacks: {
          signInSuccessWithAuthResult: () => {
            setCurrentUser(getAuth().currentUser);
            setSignedIn(true);
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
    } else {
      setSignedIn(true);
    }
  }, []);

  useEffect(() => {
    if (resizing) {
      const resize = (e: MouseEvent) => {
        setEditorWidth((editorWidth) => editorWidth - e.movementX);
      };
      const stopResizing = () => {
        setResizing(false);
      };

      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseleave", stopResizing);
      window.addEventListener("mouseup", stopResizing);
      return () => {
        window.removeEventListener("mousemove", resize);
        window.removeEventListener("mouseleave", stopResizing);
        window.removeEventListener("mouseup", stopResizing);
      };
    }
  }, [resizing]);

  const gameRoot = useRef<HTMLElement>(null);

  const documentation = (
    <div
      style={{
        filter: "url(#colorFilter)",
      }}
    >
      <AccordionGroup>
        <Accordion>
          <AccordionSummary>Title</AccordionSummary>
          <AccordionDetails>Content</AccordionDetails>
        </Accordion>
      </AccordionGroup>
    </div>
  );

  useEffect(() => {
    if (colorBlindCorrection !== "None") {
      game?.setColorCorrection(colorBlindCorrection);
    }
  }, [colorBlindCorrection]);

  const accessibility = (
    <div>
      <AccordionGroup variant="outlined">
        <Accordion>
          <AccordionSummary>Color Filtering</AccordionSummary>
          <AccordionDetails>
            <div className="colorSlider">
              <Stack
                direction={"column"}
                spacing={2}
                sx={{
                  paddingTop: "2.5rem",
                }}
              >
                <Select
                  value={colorBlindCorrection}
                  onChange={(_, value) => {
                    setColorBlindCorrection(
                      value as Parameters<typeof setColorBlindCorrection>[0]
                    );
                  }}
                >
                  {Object.keys(correctionMatrices).map((correction) => {
                    return <Option value={correction}>{correction}</Option>;
                  })}
                </Select>
              </Stack>
            </div>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
    </div>
  );

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        height={0}
        width={0}
        style={{
          display: "none",
        }}
      ></svg>
      <Modal open={!signedIn}>
        <ModalDialog>
          <div id="firebaseui-auth-container"></div>
        </ModalDialog>
      </Modal>
      <Skeleton loading={!signedIn && code !== null}>
        <Stack
          sx={{
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            minWidth: 0,
            height: "100vh",
          }}
          direction={"column"}
        >
          <Sheet
            sx={{
              backgroundColor: "#6DC0F2",
              padding: "1em",
            }}
          >
            <section aria-label="Toolbar">
              <Grid spacing={2} container>
                <Grid xs={5} md={5}>
                  <Stack direction={"row"} alignItems={"flex-start"}>
                    <Button>{currentUser?.displayName || "Sign In"}</Button>
                  </Stack>
                </Grid>
                <Grid xs={2} md={2}>
                  <img
                    style={{
                      height: "2rem",
                    }}
                    src={logoUrl}
                    alt="Woof JS Logo"
                  />
                </Grid>
                <Grid xs={5} md={5}>
                  <Stack
                    spacing={2}
                    justifyContent="flex-end"
                    alignItems="center"
                    direction="row"
                  >
                    <Button
                      tabIndex={1}
                      startDecorator={
                        <i className="fi fi-rr-universal-access"></i>
                      }
                      onClick={() => {
                        setShowEditorDrawer(
                          editorDrawer !== "accessibility"
                            ? "accessibility"
                            : false
                        );
                      }}
                    >
                      Accessibility
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </section>
          </Sheet>
          <Stack
            sx={{ flexGrow: 1, flexShrink: 1, minHeight: 0, minWidth: 0 }}
            direction={"row"}
          >
            <Stack
              sx={{ flexGrow: 1, flexShrink: 1, minHeight: 0, minWidth: 0 }}
            >
              <Sheet
                sx={{ flexGrow: 1, flexShrink: 1, minHeight: 0, minWidth: 0 }}
              >
                <section
                  ref={gameRoot}
                  aria-label="Game"
                  id="root"
                  style={{
                    filter: `url(#colorFilter)`,
                  }}
                >
                  <iframe
                    id="output"
                    style={{
                      visibility: resizing ? "hidden" : "visible",
                      border: "none",
                    }}
                  ></iframe>
                </section>
              </Sheet>
              <Stack
                direction={"row"}
                spacing={2}
                style={{
                  backgroundColor: "#6DC0F2",
                  padding: "1em",
                }}
              >
                <Button
                  onClick={async () => {
                    const game = await renderGame({
                      language: "javascript",
                      container: gameRoot.current!,
                    });
                    await game.reload(code);
                    setLoaded(true);
                    setGame(game);
                  }}
                >
                  Play
                </Button>
                <Button>Pause</Button>
              </Stack>
            </Stack>
            <Divider
              orientation="vertical"
              sx={{
                color: "white",
                backgroundColor: "#6DC0F2",
              }}
              onMouseDown={() => {
                setResizing(true);
              }}
            >
              <i className="fi fi-rr-grip-dots-vertical"></i>
            </Divider>
            <Stack direction="column" height={"100%"}>
              <Stack
                direction="row"
                sx={{
                  flexGrow: 1,
                  flexShrink: 1,
                  minHeight: 0,
                  minWidth: 0,
                }}
              >
                {editorDrawer ? (
                  <Sheet
                    sx={{
                      width: "500px",
                    }}
                  >
                    {editorDrawer === "documentation"
                      ? documentation
                      : accessibility}
                  </Sheet>
                ) : null}
                <Sheet
                  sx={{
                    width: editorWidth,
                    maxWidth: `calc(100vw - ${
                      editorDrawer ? "20em - 500px" : "20em"
                    })`,
                    minWidth: "20rem",
                  }}
                  ref={(el) => {
                    if (el) {
                      setInterval(() => {
                        if (el.offsetWidth !== editorWidth) {
                          setEditorWidth(el.offsetWidth);
                        }
                      }, 1000);
                    }
                  }}
                >
                  <section
                    aria-label="Editor"
                    style={{
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    {code !== null ? (
                      <CodeEditor
                        height={"100%"}
                        defaultValue={code}
                        onChange={(changed) => changed && setCode(changed)}
                        language="javascript"
                        options={{
                          minimap: {
                            enabled: false,
                          },
                        }}
                      />
                    ) : null}
                  </section>
                </Sheet>
              </Stack>
              <Stack
                direction={"row"}
                spacing={2}
                style={{
                  backgroundColor: "#6DC0F2",
                  padding: "1em",
                }}
              >
                <Button
                  disabled={!loaded}
                  onClick={async () => {
                    await commit(fs, "javascript", code, repoId);
                    if (game) await game.reload(code);
                  }}
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setShowEditorDrawer(
                      editorDrawer !== "documentation" ? "documentation" : false
                    );
                  }}
                >
                  Toggle Documentation
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Skeleton>
    </>
  );
};
