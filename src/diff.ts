import { NODE_TYPE, ACTION } from './consts';
import * as same from './compare';

function attributes(from: Element, to: Element) {
  if (from.attributes.length === 0 && to.attributes.length === 0) {
    return [];
  }
  const patches = [];
  const remove = new Map();
  const update = new Map();
  for (const attr of from.attributes) {
    remove.set(attr.name, attr.value);
  }
  for (const attr of to.attributes) {
    const fromAttr = remove.get(attr.name);
    if (attr.value === fromAttr) {
      remove.delete(attr.name);
    } else if (typeof fromAttr !== 'undefined') {
      remove.delete(attr.name);
      update.set(attr.name, attr.value);
    } else {
      update.set(attr.name, attr.value);
    }
  }
  for (const attr of remove.keys()) {
    patches.push({ type: ACTION.REMOVE_PROP, name: attr });
  }
  for (const [attr, value] of update.entries()) {
    patches.push({ type: ACTION.SET_PROP, name: attr, value });
  }
  return patches;
}

const s = new XMLSerializer();
function children(from: Element, to: Element) {
  const patches = [];
  const len = Math.max(from.childNodes.length, to.childNodes.length);
  // TODO: improve <head> diffing by checking for duplicates
  for (let i = 0; i < len; i++) {
    const a = from.childNodes.item(i);
    const b = to.childNodes.item(i);
    patches[i] = diff(a, b);
  }
  return patches;
}

export function diff(from: Node | undefined, to: Node | undefined) {
  if (!from) {
    return { type: ACTION.CREATE, node: to.cloneNode(true) };
  }

  if (!to) {
    return { type: ACTION.REMOVE };
  }

  if (same.type(from, to)) {
    if (
      from.nodeType === NODE_TYPE.ELEMENT ||
      from.nodeType === NODE_TYPE.DOCUMENT_FRAGMENT
    ) {
      if (same.name(from as Element, to as Element)) {
        return {
          type: ACTION.UPDATE,
          attributes: attributes(from as Element, to as Element),
          children: children(from as Element, to as Element),
        };
      }
      return {
        type: ACTION.REPLACE,
        node: to.cloneNode(true),
      };
    } else if (from.nodeType === NODE_TYPE.DOCUMENT) {
      return diff(
        (from as Document).documentElement,
        (to as Document).documentElement
      );
    } else {
      if (same.value(from, to)) return;
      return {
        type: ACTION.REPLACE,
        value: to.nodeValue,
      };
    }
  }

  return {
    type: ACTION.REPLACE,
    node: to.cloneNode(true),
  };
}
