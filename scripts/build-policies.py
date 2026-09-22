from pathlib import Path
import html,re
root=Path(__file__).resolve().parents[1]
pages=[('privacy-policy','Privacy Policy'),('terms-conditions','Terms & Conditions'),('refund-policy','Refund Policy')]
def inline(s):
 s=html.escape(s)
 s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',lambda m:'<a href="'+m[2].replace('mailto\\:','mailto:')+'">'+m[1]+'</a>',s)
 return re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',s)
def render(s):
 out=[];paragraph=[];lst=None
 def flush():
  if paragraph:out.append('<p>'+inline(' '.join(paragraph))+'</p>');paragraph.clear()
 def close():
  nonlocal lst
  if lst:out.append('</'+lst+'>');lst=None
 for line in s.splitlines():
  line=line.strip()
  if not line:flush();continue
  heading=re.match(r'^(#{1,6}) (.*)',line)
  item=re.match(r'^(?:- |(\d+)\. )(.*)',line)
  if heading:
   flush();close();n=len(heading[1]);out.append(f'<h{n}>'+inline(heading[2])+f'</h{n}>')
  elif line=='---':flush();close();out.append('<hr>')
  elif item:
   flush();kind='ol' if item[1] else 'ul'
   if lst!=kind:
    close();out.append('<'+kind+'>');lst=kind
   out.append('<li>'+inline(item[2])+'</li>')
  else:close();paragraph.append(line)
 flush();close();return '\n'.join(out)
for slug,title in pages:
 nav=''.join(f'<a href="/{s}/"'+(' aria-current="page"' if s==slug else '')+'>'+html.escape(t)+'</a>' for s,t in pages)
 body=render((root/'content'/f'{slug}.md').read_text())
 doc='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#101010"><title>'+html.escape(title)+' | White Stone Group</title><link rel="canonical" href="https://vsl.whitestonegroup.in/'+slug+'/"><link rel="stylesheet" href="/legal.css"></head><body><header><a class="brand" href="/">WHITE STONE GROUP</a><a class="back" href="/">← Back to landing page</a></header><nav aria-label="Policies">'+nav+'</nav><main><article>'+body+'</article></main><footer><a href="/">Back to landing page</a><span>©2026 vsl.whitestonegroup.in</span></footer></body></html>'
 dest=root/'dist'/slug;dest.mkdir(exist_ok=True);(dest/'index.html').write_text(doc)
 print(slug, len(body), 'HTML characters')
