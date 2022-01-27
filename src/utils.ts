const update = (el: Element, attr: string, base: string | URL) => {
  el.setAttribute(attr, new URL(el.getAttribute(attr), base).pathname);
};

export function normalizeRelativeURLs(
  el: Element | Document,
  base: string | URL
) {
  el.querySelectorAll(':is([href^="./"], [href^="../"])').forEach((item) =>
    update(item, 'href', base)
  );
  el.querySelectorAll(':is([src^="./"], [src^="../"])').forEach((item) =>
    update(item, 'src', base)
  );
}
