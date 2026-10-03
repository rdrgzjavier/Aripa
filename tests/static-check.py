"""Check HTML, local links/assets, JSON-LD and the sitemap without network access."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
from urllib.parse import urlsplit, unquote
from collections import Counter
import json, re, sys, xml.etree.ElementTree as ET
root = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self, file):
        super().__init__(convert_charrefs=True)
        self.file=file; self.ids=[]; self.refs=[]; self.canonical=[]; self.meta={}; self.h1=0; self.jsons=[]; self.script=None
        self.feed(file.read_text(encoding='utf-8'))
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.append(a['id'])
        if tag=='h1': self.h1+=1
        if tag=='meta': self.meta[a.get('name', a.get('property',''))]=a.get('content','')
        if tag=='link' and a.get('rel')=='canonical': self.canonical.append(a['href'])
        if tag in ['a','link'] and a.get('href'): self.refs.append(a['href'])
        if tag in ['script','img'] and a.get('src'): self.refs.append(a['src'])
        if tag=='script' and a.get('type')=='application/ld+json': self.script=''
    def handle_endtag(self, tag):
        if tag=='script' and self.script is not None:
            self.jsons.append(json.loads(self.script)); self.script=None
    def handle_data(self, data):
        if self.script is not None: self.script+=data
    def handle_startendtag(self, tag, attrs): self.handle_starttag(tag,attrs)
pages={p:Page(p) for p in root.rglob('*.html') if not any(part in {'.git', 'node_modules'} for part in p.relative_to(root).parts)}
errors=[]
for catalog_name in ('ai-catalog.json', 'ard.json'):
    catalog=json.loads((root/'.well-known'/catalog_name).read_text(encoding='utf-8'))
    if catalog.get('specVersion')!='1.0' or catalog.get('host',{}).get('displayName')!='Aripa' or catalog.get('entries')!=[]:
        errors.append(f'{catalog_name}: invalid or unexpected agent catalog')
if not re.search(r'^/ai-catalog\.json\s+/\.well-known/ai-catalog\.json\s+301$', (root/'_redirects').read_text(encoding='utf-8'), re.M):
    errors.append('_redirects: missing root catalog redirect')
def resolve(url, source):
    u=urlsplit(url)
    if u.scheme and (u.scheme not in ['http','https'] or u.netloc!='aripa.es'): return None,None
    if u.netloc and u.netloc!='aripa.es': return None,None
    p=root/unquote(u.path).lstrip('/') if u.path.startswith('/') else source.parent/unquote(u.path)
    if not u.path: p=source
    if p.is_dir(): p=p/'index.html'
    if not p.exists() and not p.suffix: p=p.with_suffix('.html')
    return p.resolve(),u.fragment
for file,page in pages.items():
    name=str(file.relative_to(root))
    content=unescape(file.read_text(encoding='utf-8'))
    if re.search(r'[↗→➡➜➝➔➞⇗]',content): errors.append(f'{name}: decorative arrow glyph')
    if page.h1!=1: errors.append(f'{name}: {page.h1} H1 headings')
    if name == '404.html':
        if page.canonical or 'noindex' not in page.meta.get('robots',''):
            errors.append('404.html: should be noindex without canonical')
    elif len(page.canonical)!=1: errors.append(f'{name}: canonical count {len(page.canonical)}')
    if not page.meta.get('description'): errors.append(f'{name}: missing description')
    for ident,count in Counter(page.ids).items():
        if count>1: errors.append(f'{name}: duplicate id {ident}')
    for ref in page.refs + [page.meta[k] for k in ['og:image','twitter:image'] if k in page.meta]:
        target,anchor=resolve(ref,file)
        if target is None: continue
        if not target.is_file(): errors.append(f'{name}: missing {ref}')
        elif anchor and target in pages and anchor not in pages[target].ids:
            errors.append(f'{name}: missing anchor {ref}')
    for js in re.findall(r'<script\b([^>]*)>(.*?)</script>',file.read_text(encoding='utf-8'),re.S):
        pass # JS syntax is checked by the browser suite.
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[e.text for e in ET.parse(root/'sitemap.xml').findall('s:url/s:loc',ns)]
if len(urls)!=len(set(urls)): errors.append('Duplicate sitemap URLs')
for url in urls:
    target,_=resolve(url,root/'index.html')
    if target not in pages: errors.append(f'Sitemap missing page: {url}')
    elif pages[target].canonical != [url]: errors.append(f'Sitemap/canonical mismatch: {url}')
for file,page in pages.items():
    if 'noindex' not in page.meta.get('robots','') and not any(k in file.name for k in ['politica','aviso-legal']):
        if page.canonical[0] not in urls: errors.append(f'Canonical missing from sitemap: {page.canonical[0]}')
for error in errors: print(error)
print(f'{len(pages)} HTML pages; {sum(len(p.jsons) for p in pages.values())} JSON-LD blocks; {len(urls)} sitemap URLs; {len(errors)} errors')
sys.exit(bool(errors))
