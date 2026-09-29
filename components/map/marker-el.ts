import { avatarColor, initials } from "../ui/Avatar";

export function el(html: string, className: string): HTMLDivElement {
  const d = document.createElement("div");
  d.className = className;
  d.innerHTML = html;
  return d;
}

function safe(s: string): string {
  return s.replace(/"/g, "");
}

export function buildAvatarEl(avatar: string, name: string, dot: string, selected: boolean, dimmed = false) {
  const inner = avatar
    ? `<img src="${safe(avatar)}" alt="${safe(name)}" />`
    : `<div class="md-av-fallback" style="background:${avatarColor(name)}">${initials(name)}</div>`;
  return el(
    `<div class="md-av ${selected ? "selected" : ""} ${dimmed ? "dimmed" : ""}">${inner}<span class="md-dot" style="background:${dot}"></span></div>`,
    "md-av-wrap"
  );
}

export function buildPlusEl() {
  const d = el(`<div class="md-plus"><span>+</span><i></i></div>`, "md-plus-wrap");
  d.title = "Add yourself to the map";
  return d;
}

export function buildClusterEl(count: number) {
  const d = el(`<div class="md-cluster"><span>${count}</span></div>`, "md-cluster-wrap");
  d.title = `${count} builders grouped here — tap to zoom in and split them`;
  return d;
}
