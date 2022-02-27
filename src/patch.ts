import { NODE_TYPE_DOCUMENT, ACTION_CREATE, ACTION_REMOVE, ACTION_REPLACE, ACTION_UPDATE, ACTION_SET_ATTR, ACTION_REMOVE_ATTR } from './consts';

function patchAttributes(el, patches: any) {
  if (patches.length === 0) return;
  for (const { type, name, value } of patches) {
    if (type === ACTION_REMOVE_ATTR) {
      el.removeAttribute(name);
    } else if (type === ACTION_SET_ATTR) {
      el.setAttribute(name, value);
    }
  }
}

export function patch(parent: Node, PATCH: any, child?: Node) {
  if (!PATCH) return;

  let el;
  if (parent.nodeType === NODE_TYPE_DOCUMENT) {
    parent = (parent as Document).documentElement;
    el = parent;
  } else if (!child) {
    el = parent;
  } else {
    el = child;
  }

  switch (PATCH.type) {
    case ACTION_CREATE: {
      const { node } = PATCH;
      return parent.appendChild(node);
    }
    case ACTION_REMOVE: {
      if (!el) return;
      return parent.removeChild(el);
    }
    case ACTION_REPLACE: {
      if (!el) return;
      const { node, value } = PATCH;
      if (typeof value === 'string') {
        return (el.nodeValue = value);
      }
      return el.replaceWith(node);
    }
    case ACTION_UPDATE: {
      if (!el) return;
      const { attributes, children } = PATCH;
      patchAttributes(el, attributes);
      // Freeze childNodes before mutating
      const elements = Array.from(el.childNodes) as Element[];
      children.forEach((child, index) => patch(el, child, elements[index]));
      return;
    }
  }
}
