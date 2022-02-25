import { normalizeRelativeURLs } from "./utils";
import { NODE_TYPE_ELEMENT } from "./consts";
import micromorph from "./index.js";

const isElement = (target: EventTarget): target is Element =>
  (target as Node).nodeType === NODE_TYPE_ELEMENT;
const isLocalUrl = (href: string) => {
  try {
    const url = new URL(href);
    if (window.location.origin === url.origin) {
      if (url.pathname === window.location.pathname) {
        return !url.hash;
      }
      return true;
    }
  } catch (e) {}
  return false;
};
const getUrl = ({ target }: Event): URL | undefined => {
  if (!isElement(target)) return;
  const a = target.closest("a");
  if (!a) return;
  const { href } = a;
  if (!isLocalUrl(href)) return;
  return new URL(href);
};

let p: DOMParser;
async function navigate(url: URL, isBack: boolean = false) {
  p = p || new DOMParser();
  if (!isBack) {
    history.pushState({}, "", url);
    window.scrollTo({ top: 0 });
  }
  const contents = await fetch(`${url}`)
    .then((res) => res.text())
    .catch(() => {
      window.location.assign(url);
    });
  if (!contents) return;
  const html = p.parseFromString(contents, "text/html");
  normalizeRelativeURLs(html, url);
  micromorph(document, html);
}

export default function listen() {
  if (typeof window !== "undefined") {
    window.addEventListener("click", (event) => {
      const url = getUrl(event);
      if (!url) return;
      event.preventDefault();
      try {
        navigate(url);
      } catch (e) {
        window.location.assign(url);
      }
    });

    window.addEventListener("popstate", () => {
      if (window.location.hash) return;
      try {
        navigate(new URL(window.location.toString()), true);
      } catch (e) {
        window.location.reload();
      }
      return;
    });
  }
}
