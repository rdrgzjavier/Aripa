// Local preview of this static Cloudflare Pages site. No production writes.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const redirects = fs.readFileSync(path.join(root, '_redirects'), 'utf8').split(/\r?\n/)
  .filter(line => line.trim() && !line.trim().startsWith('#')).map(line => line.trim().split(/\s+/));
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.json':'application/json; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain' };
const csp = fs.readFileSync(path.join(root, '_headers'), 'utf8').match(/Content-Security-Policy: (.+)/)?.[1];
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const rule = redirects.find(([from]) => from === url.pathname);
  if (rule) { res.writeHead(Number(rule[2]) || 301, { Location: rule[1] + url.search }); res.end(); return; }
  let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if ((!file.startsWith(root + path.sep) && file !== root) || /(?:^|[\\/])\.(?:git|codex|agents)(?:[\\/]|$)/.test(path.relative(root, file))) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!url.pathname.endsWith('/')) { res.writeHead(301, { Location: url.pathname + '/' + url.search }); res.end(); return; }
    file = path.join(file, 'index.html');
  }
  if (!fs.existsSync(file) && !path.extname(file)) file += '.html';
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store' });
    fs.createReadStream(path.join(root, '404.html')).pipe(res);
    return;
  }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store', ...(csp ? { 'Content-Security-Policy': csp } : {}) });
  fs.createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT) || 4173, '127.0.0.1', () => console.log('Aripa preview: http://127.0.0.1:' + (process.env.PORT || 4173)));
