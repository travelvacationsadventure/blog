(function(){
  const cfg=window.FIREBASE_CONFIG;
  if(!cfg||!cfg.apiKey||cfg.apiKey.startsWith('YOUR_')) return;
  if(!firebase.apps.length) firebase.initializeApp(cfg);
  const db=firebase.firestore();
  const safe=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const formatDate=v=>{const d=v?.toDate?v.toDate():new Date(v);return Number.isNaN(d.getTime())?'':d.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})};
  const card=(p,i)=>`<article class="card ${i===0?'feature':''}"><a href="post.html?slug=${encodeURIComponent(p.slug)}"><div class="media"><img loading="lazy" src="${safe(p.imageUrl)}" alt="${safe(p.title)}"></div><div class="cardbody"><div class="meta"><span>${safe(p.category)}</span><time>${safe(formatDate(p.publishedAt))}</time></div><h3>${safe(p.title)}</h3><p>${safe(p.excerpt)}</p><span class="read">Read story →</span></div></a></article>`;
  async function loadPublished(){
    const snap=await db.collection('articles').where('status','==','published').get();
    return snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.publishedAt?.seconds||0)-(a.publishedAt?.seconds||0));
  }
  async function renderLists(){
    try{const live=await loadPublished();if(!live.length)return;const grid=document.querySelector('#blog-posts');if(grid)grid.innerHTML=live.map(card).join('');const home=document.querySelector('#home-posts');if(home)home.innerHTML=live.slice(0,3).map(card).join('')}catch(e){console.warn('Firebase articles could not load:',e.message)}
  }
  function cleanHtml(html){const doc=new DOMParser().parseFromString(`<div>${html||''}</div>`,'text/html'),allowed=new Set(['DIV','P','H2','H3','STRONG','B','EM','I','UL','OL','LI','A','BR']);doc.body.querySelectorAll('*').forEach(el=>{if(!allowed.has(el.tagName)){el.replaceWith(...el.childNodes);return}[...el.attributes].forEach(a=>{if(a.name==='style'&&/^(text-align:\s*(left|right|center|justify);?\s*)$/i.test(a.value))return;if(a.name==='href'&&/^(https?:|mailto:)/i.test(a.value)){el.setAttribute('rel','nofollow noopener');return}el.removeAttribute(a.name)})});return doc.body.firstElementChild?.innerHTML||''}
  async function renderPost(){
    if(!document.querySelector('#post-page'))return;const slug=new URLSearchParams(location.search).get('slug');if(!slug)return;
    try{const snap=await db.collection('articles').where('slug','==',slug).where('status','==','published').limit(1).get();if(snap.empty)return;const p=snap.docs[0].data();document.title=p.seoTitle||`${p.title} | Travel Vacation Adventure`;document.querySelector('meta[name=description]').content=p.metaDescription||p.excerpt;document.querySelector('#post-title').textContent=p.title;document.querySelector('#post-cat').textContent=p.category;document.querySelector('#post-date').textContent=formatDate(p.publishedAt);document.querySelector('#post-image').src=p.imageUrl;document.querySelector('#post-image').alt=p.title;document.querySelector('#post-lead').textContent=p.excerpt;const body=document.querySelector('#article-body');if(p.contentHtml)body.innerHTML=cleanHtml(p.contentHtml);else{body.innerHTML='';String(p.content||'').split(/\n\s*\n/).filter(Boolean).forEach(block=>{const el=document.createElement(block.startsWith('## ')?'h2':'p');el.textContent=block.replace(/^##\s+/,'');body.appendChild(el)})}}catch(e){console.warn('Firebase article could not load:',e.message)}
  }
  renderLists();renderPost();
})();
