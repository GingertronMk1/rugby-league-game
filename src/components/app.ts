const button =
    "h-[27px] w-[27px] border border-[#496047] text-[17px] text-[#dce8d4] hover:bg-[#3b513a] cursor-pointer",
  dot = "inline-block h-1.5 w-1.5 rounded-full bg-[#c5e580] mr-2 align-middle";

const header = () => {
  return `<header class="flex h-[65px] sm:h-[76px] items-center justify-between border-b border-[#2d382d] px-[6%] text-[10px] tracking-[.16em] text-[#9aa699]">
    <div class="flex items-center gap-2.5 text-[#f0f0e4]"><span class="text-4xl leading-none text-[#d4ea86]">✳</span><div><strong class="block font-display text-xl leading-none tracking-[.08em]">THE PITCH</strong><small class="mt-1 block text-[8px] tracking-[.23em] text-[#98aa91]">RUGBY LEAGUE</small></div></div>
    <div class="hidden sm:block font-bold"><span class="${dot}"></span> MATCH DAY <span class="mx-[15px] text-[#4b594b]">/</span> STADIUM VIEW</div><div class="hidden sm:block">EST. 1895 <span class="ml-3 text-base text-[#c9e187]">✦</span></div>
  </header>`;
};
const intro = () => {
  return `<div class="mb-[22px] sm:mb-7 flex items-end justify-between"><div><div class="text-[10px] font-bold tracking-[.18em] text-[#c5df8b]"><span class="${dot}"></span> THE GREATEST GAME</div><h1 class="mt-3 mb-2 font-display text-[clamp(42px,5vw,70px)] font-bold leading-none tracking-[-.015em] uppercase">Welcome to the field<span class="text-[#c9e787]">.</span></h1><p class="text-[13px] text-[#8d9a8a]">Move with WASD. Tap H or L to pass; hold for a cut-out pass.</p></div><div class="hidden sm:block border border-[#354536] px-3.5 py-[11px] text-[10px] tracking-[.14em] text-[#aab8a3]"><span class="mr-2 text-[#cce78e]">◉</span> TOP-DOWN VIEW</div></div>`;
};
const stadium = () => {
  return `<div class="border border-[#384b39] bg-[#1b2a1e] shadow-[0_25px_60px_#0004]">
    <div class="flex h-[72px] items-center justify-between px-3.5 sm:px-[25px]"><div class="sm:w-1/4"><span class="mb-1 block text-[9px] tracking-[.15em] text-[#80917b]">MATCH CENTRE</span><strong class="font-display text-[15px] tracking-[.12em]">THE PITCH <span class="text-[#72816e]"> / </span> 01</strong></div><div class="flex items-center gap-2 sm:gap-[22px]"><div class="text-[8px] sm:text-[10px] font-bold tracking-[.13em]"><i class="mx-[7px] inline-block h-2 w-2 rounded-full bg-[#d36757]"></i> HOME</div><div class="font-display text-[26px] font-bold">0 <span class="px-[5px] text-[#7a8b77]">:</span> 0</div><div class="text-[8px] sm:text-[10px] font-bold tracking-[.13em]">AWAY <i class="mx-[7px] inline-block h-2 w-2 rounded-full bg-[#e7e5cc]"></i></div></div><div class="hidden w-1/4 text-right text-[9px] tracking-[.14em] text-[#a7b89b] sm:block"><span class="${dot}"></span> PRE-MATCH</div></div>
    <div id="scene" class="relative h-[350px] overflow-hidden sm:h-[clamp(350px,48vw,620px)] [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full" aria-label="Top-down view of a rugby league field"><div id="player-tooltip" hidden class="pointer-events-none absolute z-10 whitespace-nowrap border border-[#728b65] bg-[#101812]/95 px-3 py-2 text-xs font-bold text-[#eeeede] shadow-lg"></div></div>
    <div class="flex h-[55px] items-center justify-between px-3.5 sm:px-[25px] text-[9px] font-bold tracking-[.12em] text-[#a0af99]"><div><span class="${dot}"></span> FIELD OF PLAY <span class="px-2 text-[#526850]"> / </span> RUGBY LEAGUE</div><div class="flex items-center gap-2 sm:gap-3.5"><button class="${button}" id="minus" aria-label="Zoom out">−</button><span class="text-[#758a70]">VIEW</span><button class="${button}" id="plus" aria-label="Zoom in">+</button><button class="${button}" id="reset" aria-label="Reset view">↺</button></div></div>
  </div>`;
};
const footer = () => {
  return `<footer class="mt-[25px] flex justify-between gap-5 text-[8px] sm:text-[9px] tracking-[.13em] text-[#788a76]"><div><strong class="text-[#c6df91]">100 METRES.</strong> THIRTEEN A SIDE. ONE GAME.</div><div>MADE FOR THE LOVE OF LEAGUE <span class="ml-2 text-[15px] text-[#c6df91]">✳</span></div></footer>`;
};
export const renderApp = () => {
  return `${header()}<main class="mx-auto max-w-[1440px] px-[6%] pt-[35px] sm:pt-11 pb-[30px]">${intro()}${stadium()}${footer()}</main>`;
};
