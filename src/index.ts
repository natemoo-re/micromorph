import { diff } from './diff';
import { patch } from './patch';

export default function micromorph(from: Node, to: Node): Promise<void> {
  const patches = diff(from, to);
  return patch(from, patches);
}
