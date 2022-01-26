export function name(from: Element, to: Element) {
  if (from.nodeName === to.nodeName) {
    return true;
  }
  if (from.nodeName.toUpperCase() === to.nodeName.toUpperCase()) {
    return true;
  }
  return false;
}

export function type(from: Node, to: Node) {
  return from.nodeType === to.nodeType;
}

export function value(from: Node, to: Node) {
  return from.nodeValue === to.nodeValue;
}
