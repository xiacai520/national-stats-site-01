// World in Numbers — tiny static server for local testing only.
// Serves app/ at http://localhost:8080 (use --port for another port).
// Not part of the entry: the site itself is plain static files.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, 'app');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

const port = Number(process.argv.find((a) => a.startsWith('--port='))?.split('=')[1] ?? 8080);

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  const file = join(root, path === '/' ? 'index.html' : path);
  if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(port, () => console.log('World in Numbers at http://localhost:' + port));
