"use client";

import type Lenis from "lenis";

let instance: Lenis | null = null;
let loaded = false;

export const LOADED_EVENT = "santinel:loaded";

export function setLenis(l: Lenis | null) {
  instance = l;
}

export function getLenis() {
  return instance;
}

export function markLoaded() {
  loaded = true;
  window.dispatchEvent(new Event(LOADED_EVENT));
}

export function isLoaded() {
  return loaded;
}

/** Run cb once the preloader has finished (immediately if it already has). */
export function onLoaded(cb: () => void) {
  if (loaded) {
    cb();
    return () => {};
  }
  const h = () => cb();
  window.addEventListener(LOADED_EVENT, h, { once: true });
  return () => window.removeEventListener(LOADED_EVENT, h);
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) instance.scrollTo(el, { offset: 0, duration: 1.6 });
  else el.scrollIntoView({ behavior: "smooth" });
}
