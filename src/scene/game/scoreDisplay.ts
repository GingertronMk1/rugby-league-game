export function createScoreDisplay(host: HTMLElement) {
  const overlay = host.querySelector<HTMLElement>("#try-overlay");
  const restartButton = host.querySelector<HTMLButtonElement>("#restart-play");
  const scoreDisplay = document.querySelector<HTMLElement>("#home-score");
  if (!overlay || !restartButton || !scoreDisplay)
    throw new Error("Score controls not found");
  let homeScore = 0;
  let restart: (() => void) | undefined;
  const restartPlay = () => {
    restart?.();
    overlay.hidden = true;
    restartButton.blur();
  };
  restartButton.addEventListener("click", restartPlay);
  return {
    onTry() {
      homeScore += 4;
      scoreDisplay.textContent = String(homeScore);
      overlay.hidden = false;
      restartButton.focus();
    },
    onRestart(callback: () => void) {
      restart = callback;
    },
    dispose() {
      restartButton.removeEventListener("click", restartPlay);
    },
  };
}
