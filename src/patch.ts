import { NODE_TYPE, ACTION } from './consts';

function patchAttributes(el, patches: any) {
  if (patches.length === 0) return;
  for (const { type, name, value } of patches) {
    if (type === ACTION.REMOVE_PROP) {
      el.removeAttribute(name);
    } else if (type === ACTION.SET_PROP) {
      el.setAttribute(name, value);
    }
  }
}

export function patch(parent: Node, PATCH: any, index: number = -1) {
  if (!PATCH) return;

  let el;
  if (parent.nodeType === NODE_TYPE.DOCUMENT) {
    parent = (parent as Document).documentElement;
    el = parent;
  } else if (index === -1) {
    el = parent;
  } else {
    el = parent.childNodes.item(index);
  }

  switch (PATCH.type) {
    case ACTION.CREATE: {
      const { node } = PATCH;
      return parent.appendChild(node);
    }
    case ACTION.REMOVE: {
      if (!el) return;
      return parent.removeChild(el);
    }
    case ACTION.REPLACE: {
      const { node, value } = PATCH;
      if (typeof value === 'string') {
        return (el.nodeValue = value);
      }
      return el.replaceWith(node);
    }
    case ACTION.UPDATE: {
      const { attributes, children } = PATCH;
      patchAttributes(el, attributes);
      children.forEach((child, index) => patch(el, child, index));
      return;
    }
  }
}
