import { normalizeRelativeURLs } from "./utils";
import { NODE_TYPE_ELEMENT } from "./consts";
import micromorph from "./index.js";
import './announcer.js';

let announcer = document.createElement('route-announcer');
const isElement = (target: EventTarget | null): target is Element => (target as Node)?.nodeType === NODE_TYPE_ELEMENT;
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
const getOpts = ({ target }: Event, opts: Options): { url: URL, scroll?: boolean } | undefined => {
  if (!isElement(target)) return;
  const a = target.closest("a");
  if (!a) return;
  if (typeof opts.include === 'string' && !a.matches(opts.include)) return;
  if (typeof opts.include === 'function' && !opts.include(a)) return;
  if ('routerIgnore' in a.dataset) return;
  const { href } = a;
  if (!isLocalUrl(href)) return;
  return { url: new URL(href), scroll: 'routerNoscroll' in a.dataset ? false : undefined };
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
  await beforeDiff(html);
  let title = html.querySelector("title")?.textContent;
  if (title) {
    document.title = title;
  } else {
    const h1 = document.querySelector('h1');
    title = h1?.innerText ?? h1?.textContent ?? url.pathname;
  }
  if (announcer.textContent !== title) {
    announcer.textContent = title;
  }
  announcer.dataset.persist = '';
  html.body.appendChild(announcer);
  if (document.startViewTransition) {
    await document.startViewTransition(() => micromorph(document, html));
  } else {
    await micromorph(document, html);
  }
  await afterDiff();
  delete announcer.dataset.persist;
}

interface Options {
  beforeDiff?: (newDocument: Document) => void|Promise<void>;
  afterDiff?: () => void|Promise<void>;
  include?: string | ((element: HTMLAnchorElement) => boolean);
  scrollToTop?: boolean;
}

export default function createRouter(opts: Options = {}) {
  if (typeof window !== "undefined") {
    window.addEventListener("click", async (event) => {
      const { url, scroll: scrollToTop = opts.scrollToTop } = getOpts(event, opts) ?? {};
      if (!url) return;
      event.preventDefault();
      try {
        navigate(url, false, { ...opts, scrollToTop  });
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
  return new class Router {
    go(pathname: string, options?: Partial<Options>) {
      const url = new URL(pathname, window.location.toString())
      return navigate(url, false, { ...opts, ...options })
    }

    back() {
      return window.history.back();
    }

    forward() {
      return window.history.forward();
    }
  }
}
