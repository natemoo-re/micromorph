import morph from '../src/index';
import { normalizeRelativeURLs } from '../src/utils';

const a = `
<head>
<link href="../main.css" rel="stylesheet" />
<title>A | Micromorph</title>
<link href="https://cdn.skypack.dev/sanitize.css" rel="stylesheet" />
<link href="https://unpkg.com/sanitize.css/typography.css" rel="stylesheet" />
</head>

<body>
<div id="app">
  <p style="color: green;">Hello world!</p>
  <div>
    <h1>NO</h1>
  </div>
</div>
<script type="module" src="/index.ts"></script>
</body>
`;

const b = `
<head>
<title>B | Micromorph</title>
<link href="https://unpkg.com/sanitize.css/typography.css" rel="stylesheet" />
<link href="https://cdn.skypack.dev/sanitize.css" rel="stylesheet" />
<link href="../../main.css" rel="stylesheet" />
</head>

<body>
<div id="app">
  <p style="color: red;">Hello world?</p>
  <div>
    <h1>YES</h1>
  </div>
</div>
<script type="module" src="/index.ts"></script>
</body>
`;

const c = `
<head>
<title>C | Micromorph</title>
<link href="../../../main.css" rel="stylesheet" />
<link href="https://unpkg.com/sanitize.css/typography.css" rel="stylesheet" />
<link href="https://cdn.skypack.dev/sanitize.css" rel="stylesheet" />
</head>

<body>
<div id="app">
  <p style="color: blue;">Goodbye cruel world...</p>
  <h1>MAYBE</h1>
  <h2>Haha!</h2>
</div>
<script type="module" src="/index.ts"></script>
</body>`;

const p = new DOMParser();
const docs = [a, b, c].map((doc) => p.parseFromString(doc, 'text/html'));
const base = 'https://micromorph.stackblitz.io/';
const bases = [
  new URL('./test/', base),
  new URL('./nest/test/', base),
  new URL('./super/nest/test/', base),
];
let i = 0;

setInterval(() => {
  normalizeRelativeURLs(docs[i], bases[i]);
  morph(document, docs[i]);
  i = i === 2 ? 0 : i + 1;
}, 2500);
