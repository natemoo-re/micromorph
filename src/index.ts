import { diff } from './diff';
import { patch } from './patch';

export default function micromorph(from: Node, to: Node) {
  const patches = diff(from, to);
  patch(from, patches);
}
