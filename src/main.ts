import "./style.css";
import { createPitchScene } from "./scene/createPitchScene";
import { renderApp } from "./components/app";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App container not found");
app.innerHTML = renderApp();
const sceneHost = app.querySelector<HTMLElement>("#scene");
if (!sceneHost) throw new Error("Pitch container not found");
const pitch = createPitchScene(sceneHost);
for (const [selector, action] of [
  [
    "#plus",
    () => {
      pitch.zoomIn();
    },
  ],
  [
    "#minus",
    () => {
      pitch.zoomOut();
    },
  ],
  [
    "#reset",
    () => {
      pitch.reset();
    },
  ],
] as const) {
  const button = app.querySelector(selector);
  if (!button) throw new Error(`Missing control: ${selector}`);
  button.addEventListener("click", action);
}
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    pitch.dispose();
  });
