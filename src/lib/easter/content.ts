import easterEggs from "../../../content/easter-eggs.json";

export interface EasterEggEntry {
  id: string;
  trigger: string;
  tier: number;
}

export function loadEasterEggRegistry(): EasterEggEntry[] {
  return easterEggs as EasterEggEntry[];
}

export const FORTUNES = [
  "The best way to predict the future is to implement it.",
  "There are only two hard things in CS: cache invalidation and naming things.",
  "ROOT OS: where every bug is a feature waiting for a man page.",
  "Guest today, contributor tomorrow.",
  "Warning: excessive terminal usage may lead to portfolio enlightenment.",
  "In space no one can hear you segfault.",
  "Have you tried turning it off and on again? (shutdown -h now)",
  "The matrix has you... for 8 seconds.",
] as const;

export const COW_ASCII = `
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
`.trim();

export const SL_TRAIN = `
      ====        ________                ___________
  _D _|  |_______/        \\__I_I_____===__|_________|
   |(_)---  |   H\\________/ |   |        =|___ ___|      ________________
   /     |  |   H  |  |     |   |         ||_| |_||     _|
  |      |  |   H  |__--------------------| [___] |   =|
  | ________|___H__/__|_____/[][]~\\_______|       |   -|
  |/ |   |-----------I_____I [][] []  D   |=======|____|___________________
__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|____________________
  |/-=|___|=O=====O=====O=====O   |_____/~\\___/          
   \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            
`.trim();

export const NEOFETCH_LOGO = `
       ▄▄▄▄▄▄▄    guest@devbox
      █ ROOT OS █  ─────────────
       ▀▀▀▀▀▀▀▀    OS: ROOT OS 0.1.0
                    Kernel: personal-kernel-space
                    Uptime: session
                    Shell: bash (fake)
                    Terminal: xterm.js
`.trim();
