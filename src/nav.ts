import { normalizeRelativeURLs } from "./utils";
import micromorph from "./index.js";
import './announcer.js';

let noop = () => {};
let p: DOMParser;
interface Options {
  beforeDiff?: (newDocument: Document) => void|Promise<void>;
  afterDiff?: () => void|Promise<void>;
  include?: string | ((element: HTMLAnchorElement) => boolean);
  scrollToTop?: boolean;
}

let announcer = document.createElement('route-announcer');

export default function createRouter(opts: Options = {}) {
  if (typeof window !== "undefined" && 'navigation' in window) {
    navigation.addEventListener('navigate', (e) => {
      if (!e.canTransition || e.hashChange || e.downloadRequest !== null) {
        return;
      }
      const src = new URL(location.toString());
      const dest = new URL(e.destination.url);
      if (src.toString() === dest.toString()) {
        if (opts.scrollToTop ?? true) {
          window.scrollTo({ top: 0 });
        }
        return;
      }
      const { beforeDiff = noop, afterDiff = noop } = opts;
      p = p || new DOMParser();
      async function navigate() {
        const contents = await fetch(dest.toString()).then((res) => res.text());
        const html = p.parseFromString(contents, "text/html");
        normalizeRelativeURLs(html, dest);
        await beforeDiff(html);
        
        let title = html.querySelector("title")?.textContent;
        if (title) {
          document.title = title;
        } else {
          const h1 = document.querySelector('h1');
          title = h1?.innerText ?? h1?.textContent ?? dest.pathname;
        }
        if (announcer.textContent !== title) {
          announcer.textContent = title;
        }
        announcer.dataset.persist = '';
        html.body.appendChild(announcer);
        await micromorph(document, html);
        if (opts.scrollToTop ?? true) {
          window.scrollTo({ top: 0 });
        }
        await afterDiff();
        delete announcer.dataset.persist;
      }

      if (!document.startViewTransition) {
        e.intercept(navigate())
        return;
      }

      e.intercept(document.startViewTransition(() => navigate()));
    });
  }

  return new class Router {
    go(pathname: string) {
      const url = new URL(pathname, window.location.toString())
      return navigation.navigate(url)
    }

    back() {
      return navigation.back();
    }

    forward() {
      return navigation.forward();
    }
  }
}

