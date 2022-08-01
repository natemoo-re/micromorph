interface Options {
  beforeDiff?: (newDocument: Document) => void|Promise<void>;
  afterDiff?: () => void|Promise<void>;
  include?: string | ((element: HTMLAnchorElement) => boolean);
  scrollToTop?: boolean;
}
export default function listen(opts?: Options): void;
