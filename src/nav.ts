import { normalizeRelativeURLs } from "./utils";
import micromorph from "./index.js";

let noop = () => {};
let p: DOMParser;
interface Options {
  beforeDiff?: (newDocument: Document) => void|Promise<void>;
  afterDiff?: () => void|Promise<void>;
  include?: string | ((element: HTMLAnchorElement) => boolean);
  scrollToTop?: boolean;
}

export default function listen(opts: Options = {}) {
  if (typeof window !== "undefined" && 'navigation' in window) {
    navigation.addEventListener('navigate', (e) => {
      if (!e.canTransition || e.hashChange || e.downloadRequest !== null) {
        return;
      }
      const src = new URL(location.toString());
      const dest = new URL(e.destination.url);
      console.log(e, { src, dest });
      const { beforeDiff = noop, afterDiff = noop } = opts;
      p = p || new DOMParser();
      async function navigate() {
        const contents = await fetch(dest.toString()).then((res) => res.text());
        const html = p.parseFromString(contents, "text/html");
        normalizeRelativeURLs(html, dest);
        beforeDiff(html);
        const title = html.querySelector("title");
        if (title) {
          document.title = title.text;
        }
        await micromorph(document, html);
        afterDiff();
      }
      e.transitionWhile(navigate())
    });
  }
}
