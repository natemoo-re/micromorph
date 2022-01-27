const compare = (attr: string) => (from: Node, to: Node) => from[`node${attr}`] === to[`node${attr}`];
export const name = compare('Name');
export const type = compare('Type');
export const value = compare('Value');
