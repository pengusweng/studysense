/** Where an explicit light/dark choice is kept on this device. Shared with lib/theme.ts. */
export const THEME_KEY = "studysense.theme";

/** Runs in <head> before first paint, so a stored choice never flashes the other theme. Server-safe. */
export const themeScript = `try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;
