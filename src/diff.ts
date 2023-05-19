import { NODE_TYPE_ELEMENT, NODE_TYPE_TEXT, NODE_TYPE_DOCUMENT, ACTION_CREATE, ACTION_REMOVE, ACTION_REPLACE, ACTION_UPDATE, ACTION_SET_ATTR, ACTION_REMOVE_ATTR } from './consts';
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
    patches.push({ type: ACTION_REMOVE_ATTR, name: attr });
  }
  for (const [attr, value] of update.entries()) {
    patches.push({ type: ACTION_SET_ATTR, name: attr, value });
  }
  return patches;
}

function serialize(el: Element, data = true) {
  let key = `${el.localName}`;
  for (const { name, value } of el.attributes) {
    if (data && name.startsWith('data-')) continue;
    key += `[${name}=${value}]`
  }
  key += el.innerHTML;
  return key;
}
function getKey(el: Element) {
  switch (el.tagName) {
    case 'BASE':
    case 'TITLE': 
      return el.localName;
    case 'META': {
      if (el.hasAttribute('name')) return `meta[name="${el.getAttribute('name')}"]`
      if (el.hasAttribute('property')) return `meta[name="${el.getAttribute('property')}"]`
      break;
    }
    case 'LINK': {
      if (el.hasAttribute('rel') && el.hasAttribute('href')) return `link[rel="${el.getAttribute('rel')}"][href="${el.getAttribute('href')}"]`
      if (el.hasAttribute('href')) return `link[href="${el.getAttribute('href')}"]`
      break;
    }
  }
  return serialize(el);
}

function cachebust(src: string): string {
  const [base, query = ''] = src.split('?');
  return `${base}?t=${Date.now()}&${query.replace(/t=\d+/g, '')}`;
}

function clone(node: Node) {
  if (node.nodeType === NODE_TYPE_ELEMENT && (node as Element).hasAttribute('data-persist')) {
    return node;
  }
  if (node.nodeType === NODE_TYPE_ELEMENT && (node as Element).localName === 'script') {
    // 4.12.1.1: cloneNode persists a <script> elements' loading state
    // https://html.spec.whatwg.org/multipage/scripting.html#script-processing-model
    const script = document.createElement('script');
    for (let { name, value } of (node as Element).attributes) {
      if (name === 'src') {
        value = cachebust(value);
      }
      script.setAttribute(name, value);
    }
    script.innerHTML = (node as Element).innerHTML;
    return script;
  }
  return node.cloneNode(true);
}

function uniqueChildren(from: Element, to: Element) {
  if (from.children.length === 0 && to.children.length === 0) {
    return [];
  }
  const patches = [];
  const remove = new Map();
  const update = new Map();
  const add = new Map();
  for (const child of from.children) {
    remove.set(getKey(child), child);
  }
  for (const child of to.children) {
    const key = getKey(child);
    const fromEl = remove.get(key);
    if (fromEl) {
      if (serialize(child, false) !== serialize(fromEl, false)) {
        update.set(key, clone(child));
      }
    } else {
      add.set(key, clone(child));
    }
    remove.delete(key);
  }
  for (const node of from.childNodes) {
    if (node.nodeType === NODE_TYPE_ELEMENT) {
      const key = getKey(node as Element);
      if (remove.has(key)) {
        patches.push({ type: ACTION_REMOVE });
        continue;
      } else if (update.has(key)) {
        const nodeTo = update.get(key);
        patches.push({
          type: ACTION_UPDATE,
          attributes: attributes(node as Element, nodeTo as Element),
          children: children(node as Element, nodeTo as Element),
        });
        continue;
      }
    }
    patches.push(undefined);
  }
  for (const node of add.values()) {
    patches.push({ type: ACTION_CREATE, node: clone(node) });
  }
  return patches;
}

function children(from: Element, to: Element) {
  const patches = [];
  const len = Math.max(from.childNodes.length, to.childNodes.length);
  for (let i = 0; i < len; i++) {
    let a = from.childNodes.item(i);
    let b = to.childNodes.item(i);
    patches[i] = diff(a, b);
  }
  return patches;
}

export function diff(from: Node | undefined, to: Node | undefined) {
  if (!from) {
    return { type: ACTION_CREATE, node: clone(to) };
  }

  if (!to) {
    return { type: ACTION_REMOVE };
  }

  if (same.type(from, to)) {
    if (from.nodeType === NODE_TYPE_TEXT) {
      const a = from.nodeValue;
      const b = to.nodeValue;
      if (a.trim().length === 0 && b.trim().length === 0) return;
    }
    if (
      from.nodeType === NODE_TYPE_ELEMENT
    ) {
      if (same.name(from as Element, to as Element)) {
        const childFn = (from as Element).tagName === 'HEAD' ? uniqueChildren : children;
        return {
          type: ACTION_UPDATE,
          attributes: attributes(from as Element, to as Element),
          children: childFn(from as Element, to as Element),
        };
      }
      return {
        type: ACTION_REPLACE,
        node: clone(to),
      };
    } else if (from.nodeType === NODE_TYPE_DOCUMENT) {
      return diff(
        (from as Document).documentElement,
        (to as Document).documentElement
      );
    } else {
      if (same.value(from, to)) return;
      return {
        type: ACTION_REPLACE,
        value: to.nodeValue,
      };
    }
  }

  return {
    type: ACTION_REPLACE,
    node: clone(to),
  };
}
