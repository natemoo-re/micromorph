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
const getUrl = ({ target }: Event, opts: Options): URL | undefined => {
  if (!isElement(target)) return;
  const a = target.closest("a");
  if (!a) return;
  if (typeof opts.include === 'string' && !a.matches(opts.include)) return;
  if (typeof opts.include === 'function' && !opts.include(a)) return;
  const { href } = a;
  if (!isLocalUrl(href)) return;
  return new URL(href);
};

let noop = () => {};
let p: DOMParser;
async function navigate(url: URL, isBack: boolean = false, opts: Options) {
  const { beforeDiff = noop, afterDiff = noop } = opts;
  p = p || new DOMParser();
  const contents = await fetch(`${url}`)
    .then((res) => res.text())
    .catch(() => {
      window.location.assign(url);
    });
  if (!contents) return;
  if (!isBack) {
    history.pushState({}, "", url);
    // undefined defaults to true
    if (opts.scrollToTop ?? true) {
      window.scrollTo({ top: 0 });
    }
  }
  const html = p.parseFromString(contents, "text/html");
  normalizeRelativeURLs(html, url);
  beforeDiff(html);
  const title = html.querySelector("title");
  if (title) {
    document.title = title.text;
  }
  await micromorph(document, html);
  afterDiff();
}

interface Options {
  beforeDiff?: (newDocument: Document) => void|Promise<void>;
  afterDiff?: () => void|Promise<void>;
  include?: string | ((element: HTMLAnchorElement) => boolean);
  scrollToTop?: boolean;
}

export default function listen(opts: Options = {}) {
  if (typeof window !== "undefined") {
    window.addEventListener("click", async (event) => {
      const url = getUrl(event, opts);
      if (!url) return;
      event.preventDefault();
      try {
        navigate(url, false, opts);
      } catch (e) {
        window.location.assign(url);
      }
    });

    window.addEventListener("popstate", () => {
      if (window.location.hash) return;
      try {
        navigate(new URL(window.location.toString()), true, opts);
      } catch (e) {
        window.location.reload();
      }
      return;
    });
  }
}
