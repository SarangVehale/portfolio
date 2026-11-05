import re,urllib.request,urllib.parse,sys
UA={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'}
OUT='site/assets/fonts/'
def css(q): return urllib.request.urlopen(urllib.request.Request('https://fonts.googleapis.com/css2?'+q,headers=UA),timeout=30).read().decode()
def get(u,name):
    b=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60).read(); open(OUT+name,'wb').write(b); print(name,len(b)//1024,'KB')
def blocks(c):
    for m in re.finditer(r'/\*\s*([\w-]+)\s*\*/\s*@font-face\s*{(.*?)}',c,re.S):
        yield m.group(1),m.group(2)
for fam,q,base in [
 ('Fraunces','family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..700,0..100,0..1;1,9..144,300..700,0..100,0..1&display=swap','fraunces'),
 ('Space Grotesk','family=Space+Grotesk:wght@300..700&display=swap','spacegrotesk'),
 ('Space Mono','family=Space+Mono:wght@400;700&display=swap','spacemono')]:
    c=css(q); seen=set()
    for sub,b in blocks(c):
        if sub not in('latin','latin-ext'):continue
        u=re.search(r'url\((.*?)\)',b).group(1)
        st=re.search(r'font-style:\s*(\w+)',b).group(1); w=re.search(r'font-weight:\s*([\d ]+)',b).group(1).strip()
        k=f'{base}-{st}-{w.replace(" ","_")}-{sub}.woff2'
        if k not in seen: get(u,k); seen.add(k)
JP='へより人便偵光具写問固工房技携数文日智書格械機真知章縁色覚記証道鍵闇音'
DV='ंएकखगघचजञटडणतदधनपबभमयरलवशषस़ािीुृेॉोौ् '
MATH='|⟨⟩ψρΣ∑χ⊗⊕πθφ−≤≥∈∩∪→⁻¹⁰²³₂₁√αβ'
for fam,w,txt,name in [('Noto+Sans+JP','500',JP,'jp'),('Noto+Sans+Devanagari','500',DV,'dev'),('Noto+Sans+Math','400',MATH,'math')]:
    q=f'family={fam}'+(f':wght@{w}' if name!='math' else '')+'&text='+urllib.parse.quote(txt)
    c=css(q); get(re.search(r'url\((.*?)\)',c).group(1),name+'.woff2')
