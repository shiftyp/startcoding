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
// @ts-ignore
import logoUrl from "../images/logowhite.png";
import Slider from "@mui/joy/Slider";
import Chip from "@mui/joy/Chip";
import Input from "@mui/joy/Input";
import FormLabel from "@mui/joy/FormLabel";
import FormControl from "@mui/joy/FormControl";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth"

export const App = ({ authUI }: { authUI: firebaseui.auth.AuthUI }) => {
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
  >(null);
  const [paletteUrl, setPaletteUrl] = useState<string | null>(null);
  const [gameSpeed, setGameSpeed] = useState<number>(100);
  const [playSpeed, setPlaySpeed] = useState<number>(gameSpeed);
  const [shouldGeneratePalette, setShouldGeneratePalette] = useState(false);
  const [hueRotation, setHueRotation] = useState(0);
  const [contrastPercentage, setContrastPercentage] = useState(100);
  const [brightnessPercentage, setBrightnessPercentage] = useState(100);
  const [loginScreen, setLoginScreen] = useState<Element | null>(null);
  const [pointerRemap, setPointerRemap] = useState<
    Record<"UP" | "DOWN" | "LEFT" | "RIGHT" | "CLICK", KeyboardEvent["key"]>
  >(
    {} as Record<
      "UP" | "DOWN" | "LEFT" | "RIGHT" | "CLICK",
      KeyboardEvent["key"]
    >
  );
  const [pointerRemapSensitivity, setPointerRemapSensitivity] = useState(20);

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
    const newCode = new TextDecoder().decode(file);
    setCode(newCode);
    setGame(
      await renderGame({
        language: "javascript",
        container: gameRoot.current!,
      })
    );
  }, []);

  useEffect(() => {
      loadCode();
  }, []);

  useEffect(() => {
    game?.onUpdatePalette((url) => {
      setPaletteUrl(url);
    });
  }, [game]);

  useEffect(() => {
    return () => {
      if (paletteUrl) {
        URL.revokeObjectURL(paletteUrl);
      }
    };
  }, [paletteUrl]);

  useEffect(() => {
    if (!signedIn) {
      setSignedIn(true);
    }
  }, [loginScreen]);

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

  useEffect(() => {
    game?.setGameSpeed(gameSpeed);
  }, [gameSpeed]);

  useEffect(() => {
    game?.setGeneratePalette(shouldGeneratePalette);
  }, [shouldGeneratePalette]);

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
    game?.setColorCorrection(colorBlindCorrection);
  }, [colorBlindCorrection]);

  useEffect(() => {
    game?.setPointerRemap(pointerRemap, pointerRemapSensitivity);
  }, [pointerRemap, pointerRemapSensitivity]);

  const gameFilter = `hue-rotate(${hueRotation}deg) contrast(${contrastPercentage}%) brightness(${brightnessPercentage}%)`;

  const accessibility = (
    <div
      style={{
        overflow: "auto",
        maxHeight: "100%",
      }}
    >
      <AccordionGroup variant="outlined">
        <Accordion>
          <AccordionSummary>Control and Speed Adjustments</AccordionSummary>
          <AccordionDetails>
            <h4>Game Speed</h4>
            <Stack
              direction={"row"}
              spacing={2}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <i className="fi fi-rr-rabbit-fast"></i>
              <Slider
                tabIndex={1}
                valueLabelDisplay={"on"}
                aria-labelledby="speed-label"
                min={5}
                max={100}
                step={5}
                value={playSpeed}
                onChange={(_, value) => {
                  if (gameSpeed > 0) {
                    setGameSpeed(value as number);
                  }
                  setPlaySpeed(value as number);
                }}
              />
              <i className="fi fi-rr-turtle"></i>
            </Stack>
            <h4>Use Keyboard as Pointer Device</h4>
            <h5>Map Keys to Pointer Events</h5>
            <FormControl>
              <FormLabel>Up</FormLabel>
              <Input
                value={pointerRemap.UP}
                placeholder="Up"
                onKeyUp={(event) => {
                  setPointerRemap({ ...pointerRemap, UP: event.key });
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Down</FormLabel>
              <Input
                value={pointerRemap.DOWN}
                placeholder="Down"
                onKeyUp={(event) => {
                  setPointerRemap({ ...pointerRemap, DOWN: event.key });
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Left</FormLabel>
              <Input
                value={pointerRemap.LEFT}
                placeholder="Left"
                onKeyUp={(event) => {
                  setPointerRemap({ ...pointerRemap, LEFT: event.key });
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Right</FormLabel>
              <Input
                placeholder="Right"
                value={pointerRemap.RIGHT}
                onKeyUp={(event) => {
                  setPointerRemap({ ...pointerRemap, RIGHT: event.key });
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Click</FormLabel>
              <Input
                value={pointerRemap.CLICK}
                placeholder="Click"
                onKeyUp={(event) => {
                  setPointerRemap({ ...pointerRemap, CLICK: event.key });
                }}
              />
            </FormControl>
            <h5>Pointer Sensitivity</h5>
            <Slider
              tabIndex={1}
              valueLabelDisplay={"on"}
              min={1}
              max={50}
              step={1}
              value={pointerRemapSensitivity}
              onChange={(_, value) => {
                setPointerRemapSensitivity(value as number);
              }}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion
          onChange={(_, expanded) => {
            setShouldGeneratePalette(expanded);
          }}
        >
          <AccordionSummary>Color Adjustments</AccordionSummary>
          <AccordionDetails>
            <Stack
              direction={"column"}
              spacing={2}
              sx={{
                paddingTop: "2.5rem",
              }}
            >
              <h4>Game Palette</h4>
              <Stack
                sx={{ height: 40, overflow: "hidden" }}
                alignItems={"center"}
              >
                {paletteUrl ? (
                  <img
                    src={paletteUrl}
                    alt="Current Game Palette"
                    style={{
                      filter: gameFilter,
                    }}
                  />
                ) : null}
              </Stack>
              <h4>Color Replacement</h4>
              <Select
                aria-label="Color Replacement Selection"
                value={colorBlindCorrection ? colorBlindCorrection : "none"}
                onChange={(_, value) => {
                  setColorBlindCorrection(
                    (value === "none" ? null : value) as Parameters<
                      typeof setColorBlindCorrection
                    >[0]
                  );
                }}
              >
                {[
                  ["none", "none"],
                  ["protanope", "less red"],
                  ["deuteranope", "less green"],
                  ["tritanope", "less blue"],
                ].map(([correction, label]) => {
                  return <Option value={correction}>{label}</Option>;
                })}
              </Select>
              <h4>Color Shift</h4>
              <div className="colorSlider">
                <Slider
                  valueLabelDisplay={"on"}
                  aria-label="Hue Selection"
                  min={0}
                  max={360}
                  step={1}
                  value={hueRotation}
                  onChange={(_, value) => {
                    setHueRotation(value as number);
                  }}
                />
              </div>
              <h4>Contrast Shift</h4>
              <div className="contrastSlider">
                <Slider
                  valueLabelDisplay={"on"}
                  aria-label="Contrast Selection"
                  min={50}
                  max={200}
                  step={10}
                  value={contrastPercentage}
                  onChange={(_, value) => {
                    setContrastPercentage(value as number);
                  }}
                />
              </div>
              <h4>Brightness Shift</h4>
              <div className="Brightness">
                <Slider
                  valueLabelDisplay={"on"}
                  aria-label="Brightness Selection"
                  min={50}
                  max={200}
                  step={10}
                  value={brightnessPercentage}
                  onChange={(_, value) => {
                    setBrightnessPercentage(value as number);
                  }}
                />
              </div>
            </Stack>
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
          <StyledFirebaseAuth uiConfig={{
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
          }} firebaseAuth={getAuth()}/>
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
                      filter: gameFilter,
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
                  disabled={code === null}
                  onClick={async () => {
                    await game?.reload(code!);
                    setLoaded(true);
                    setGame(game);
                  }}
                >
                  Start
                </Button>
                <Button
                  disabled={gameSpeed !== 0 || !loaded}
                  onClick={async () => {
                    setGameSpeed(playSpeed);
                  }}
                >
                  Play
                </Button>
                <Button
                  disabled={gameSpeed === 0 || !loaded}
                  onClick={() => {
                    setGameSpeed(0);
                  }}
                >
                  Pause
                </Button>
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
                    await commit(fs, "javascript", code!, repoId);
                    if (game) await game.reload(code!);
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
