// app.js - ZEE WEB (SPA sederhana)
// Admin password default
const DEFAULT_ADMIN_PASSWORD = 'azizdenaa2512';
// WhatsApp number (user-provided)
const WA_NUMBER = '6285780024940'; // international format (no leading zero), used in wa.me links

// Storage keys
const STORAGE_KEY = 'zee_web_data_v1';
const ORDERS_KEY = 'zee_web_orders_v1';

// Default data
const defaultData = {
  music: [
    // contoh (opsional)
    // { id: id(), title: 'Contoh Lagu', artist: 'Artist', url: 'https://...' }
  ],
  videos: [
    // { id: id(), title: 'Contoh Video', url: 'https://youtu.be/...' }
  ],
  items: [
    // { id, name, price, menu: 'THE FORGE'|'FISH IT', desc, image }
  ]
};

// util
function id(){ return Math.random().toString(36).slice(2,9) }
function qs(s, ctx=document){ return ctx.querySelector(s) }
function qsa(s, ctx=document){ return Array.from(ctx.querySelectorAll(s)) }

// load/save
function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return JSON.parse(JSON.stringify(defaultData));
    return JSON.parse(raw);
  }catch(e){
    console.error(e);
    return JSON.parse(JSON.stringify(defaultData));
  }
}
function saveData(d){ localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
function loadOrders(){ return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') }
function saveOrders(o){ localStorage.setItem(ORDERS_KEY, JSON.stringify(o)) }

let data = loadData();
let isAdmin = false;

// routing & render
const appEl = qs('#app');
const navLinks = qsa('.nav-link');

function setActiveNav(route){
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.route === route));
}

function renderRoute(route){
  setActiveNav(route);
  appEl.innerHTML = '';
  if(route === 'home') renderHome();
  else if(route === 'music') renderMusic();
  else if(route === 'videos') renderVideos();
  else if(route === 'game') renderGame();
  else renderHome();
}

// Home
function renderHome(){
  const tpl = qs('#homeTpl').content.cloneNode(true);
  appEl.appendChild(tpl);
}

// Music
function renderMusic(){
  const tpl = qs('#musicTpl').content.cloneNode(true);
  appEl.appendChild(tpl);
  const playlistEl = qs('#playlist');
  const audio = qs('#audioPlayer');
  const nowPlaying = qs('#nowPlaying');

  function renderPlaylist(){
    playlistEl.innerHTML = '';
    data.music.forEach(m => {
      const li = document.createElement('li');
      li.className = 'entry';
      li.innerHTML = `<div class="meta"><strong>${escape(m.title)}</strong><div class="muted">${escape(m.artist||'')}</div></div>
        <div class="controls">
          <button class="btn playBtn" data-id="${m.id}">Play</button>
          ${isAdmin ? `<button class="secondary delMusicBtn" data-id="${m.id}">Hapus</button>` : '' }
        </div>`;
      playlistEl.appendChild(li);
    });
    qsa('.playBtn').forEach(b => b.addEventListener('click', ()=>{
      const mid = b.dataset.id;
      const track = data.music.find(x=>x.id===mid);
      if(!track) return;
      audio.src = track.url;
      audio.play();
      nowPlaying.textContent = `Now playing: ${track.title} ${track.artist? '— ' + track.artist : ''}`;
    }));
    qsa('.delMusicBtn').forEach(b => b.addEventListener('click', ()=>{
      if(!confirm('Hapus musik?')) return;
      data.music = data.music.filter(x=>x.id!==b.dataset.id);
      saveData(data);
      renderPlaylist();
    }));
  }

  renderPlaylist();
  audio.addEventListener('ended', ()=> nowPlaying.textContent = 'Tidak ada lagu diputar');
}

// Videos
function renderVideos(){
  const tpl = qs('#videosTpl').content.cloneNode(true);
  appEl.appendChild(tpl);
  const grid = qs('#videosGrid');

  function renderGrid(){
    grid.innerHTML = '';
    if(data.videos.length === 0){
      grid.innerHTML = '<div class="card muted">Belum ada video. (Tambahkan lewat admin)</div>';
      return;
    }
    data.videos.forEach(v => {
      const card = document.createElement('div');
      card.className = 'card';
      const media = createVideoEmbed(v.url);
      card.innerHTML = `<h4>${escape(v.title)}</h4>`;
      card.appendChild(media);
      const actions = document.createElement('div');
      actions.style.marginTop = '8px';
      if(isAdmin){
        const del = document.createElement('button');
        del.className = 'secondary';
        del.textContent = 'Hapus';
        del.addEventListener('click', ()=>{
          if(!confirm('Hapus video?')) return;
          data.videos = data.videos.filter(x=>x.id!==v.id);
          saveData(data);
          renderGrid();
        });
        actions.appendChild(del);
      }
      card.appendChild(actions);
      grid.appendChild(card);
    });
  }

  renderGrid();
}

// Game (Roblox) with sub-pages for THE FORGE and FISH IT
function renderGame(){
  const tpl = qs('#gameTpl').content.cloneNode(true);
  appEl.appendChild(tpl);
  const subBtns = qsa('.nav-sub');
  const gameContent = qs('#gameContent');

  function renderSub(menu){
    gameContent.innerHTML = '';
    const items = data.items.filter(it => it.menu === menu);
    const title = document.createElement('h3'); title.textContent = menu;
    gameContent.appendChild(title);
    const grid = document.createElement('div'); grid.className = 'grid';
    if(items.length === 0){
      grid.innerHTML = `<div class="card muted">Belum ada item pada ${menu}. Tambahkan lewat admin.</div>`;
    } else {
      items.forEach(it => {
        const c = document.createElement('div'); c.className = 'card';
        c.innerHTML = `
          ${it.image? `<img src="${it.image}" style="width:100%;height:150px;object-fit:cover;border-radius:6px;margin-bottom:8px">` : ''}
          <strong>${escape(it.name)}</strong>
          <div class="muted">Rp ${formatNumber(it.price)}</div>
          <p class="muted">${escape(it.desc||'')}</p>
        `;
        const buy = document.createElement('button');
        buy.className = 'btn';
        buy.textContent = 'Beli';
        buy.addEventListener('click', ()=>{
          openWhatsApp(it);
        });
        c.appendChild(buy);

        if(isAdmin){
          const edit = document.createElement('button');
          edit.className = 'secondary';
          edit.style.marginLeft = '8px';
          edit.textContent = 'Edit';
          edit.addEventListener('click', ()=> populateItemForm(it.id));
          c.appendChild(edit);

          const del = document.createElement('button');
          del.className = 'danger';
          del.style.marginLeft = '8px';
          del.textContent = 'Hapus';
          del.addEventListener('click', ()=>{
            if(!confirm('Hapus item?')) return;
            data.items = data.items.filter(x=>x.id!==it.id);
            saveData(data);
            renderSub(menu);
          });
          c.appendChild(del);
        }

        grid.appendChild(c);
      });
    }
    gameContent.appendChild(grid);
  }

  subBtns.forEach(b => b.addEventListener('click', ()=> renderSub(b.dataset.sub)));
}

// WhatsApp order
function openWhatsApp(item){
  const text = encodeURIComponent(`Halo, saya mau beli: ${item.name} (Rp ${item.price.toLocaleString('id-ID')}).`);
  const url = `https://wa.me/${WA_NUMBER}?text=${text}`;
  window.open(url, '_blank');
}

// Admin UI
const adminBtn = qs('#adminBtn');
const adminModal = qs('#adminModal');
const adminLoginForm = qs('#adminLoginForm');
const adminLoginStatus = qs('#adminLoginStatus');
const adminControls = qs('#adminControls');

adminBtn.addEventListener('click', ()=> openModal(adminModal));
qsa('.close').forEach(b => b.addEventListener('click', (ev)=>{
  const target = qs('#' + ev.currentTarget.dataset.target) || ev.currentTarget.closest('.modal');
  if(target) closeModal(target);
}));

function openModal(el){ el.classList.remove('hidden') }
function closeModal(el){ el.classList.add('hidden') }

adminLoginForm.addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const pw = qs('#adminPassword').value;
  if(pw === DEFAULT_ADMIN_PASSWORD){
    isAdmin = true;
    adminLoginStatus.textContent = 'Login berhasil';
    adminControls.classList.remove('hidden');
    renderAdminLists();
  } else {
    adminLoginStatus.textContent = 'Password salah';
  }
});

function renderAdminLists(){
  renderMusicAdmin();
  renderVideoAdmin();
  renderItemsAdmin();
}

function renderMusicAdmin(){
  const musicList = qs('#musicList');
  musicList.innerHTML = '';
  data.music.forEach(m=>{
    const li = document.createElement('li');
    li.className = 'entry';
    li.innerHTML = `<div class="meta"><strong>${escape(m.title)}</strong><div class="muted">${escape(m.artist||'')}</div></div>
      <div>
        <button class="secondary editMusic" data-id="${m.id}">Edit</button>
        <button class="danger delMusic" data-id="${m.id}">Hapus</button>
      </div>`;
    musicList.appendChild(li);
  });
  qsa('.delMusic').forEach(b => b.addEventListener('click', ()=>{
    if(!confirm('Hapus musik?')) return;
    data.music = data.music.filter(x=>x.id!==b.dataset.id);
    saveData(data);
    renderMusicAdmin();
  }));
  qsa('.editMusic').forEach(b => b.addEventListener('click', ()=>{
    const m = data.music.find(x=>x.id===b.dataset.id);
    if(!m) return;
    qs('#musicTitle').value = m.title;
    qs('#musicArtist').value = m.artist || '';
    qs('#musicUrl').value = m.url;
    qs('#musicForm').dataset.edit = m.id;
  }));
}

function renderVideoAdmin(){
  const videoList = qs('#videoList');
  videoList.innerHTML = '';
  data.videos.forEach(v=>{
    const li = document.createElement('li');
    li.className = 'entry';
    li.innerHTML = `<div class="meta"><strong>${escape(v.title)}</strong><div class="muted">${escape(v.url)}</div></div>
      <div>
        <button class="secondary editVideo" data-id="${v.id}">Edit</button>
        <button class="danger delVideo" data-id="${v.id}">Hapus</button>
      </div>`;
    videoList.appendChild(li);
  });
  qsa('.delVideo').forEach(b => b.addEventListener('click', ()=>{
    if(!confirm('Hapus video?')) return;
    data.videos = data.videos.filter(x=>x.id!==b.dataset.id);
    saveData(data);
    renderVideoAdmin();
  }));
  qsa('.editVideo').forEach(b => b.addEventListener('click', ()=>{
    const v = data.videos.find(x=>x.id===b.dataset.id);
    if(!v) return;
    qs('#videoTitle').value = v.title;
    qs('#videoUrl').value = v.url;
    qs('#videoForm').dataset.edit = v.id;
  }));
}

function renderItemsAdmin(){
  const itemsList = qs('#itemsList');
  itemsList.innerHTML = '';
  data.items.forEach(it=>{
    const li = document.createElement('li');
    li.className = 'entry';
    li.innerHTML = `<div class="meta"><strong>${escape(it.name)}</strong><div class="muted">${it.menu} · Rp ${formatNumber(it.price)}</div></div>
      <div>
        <button class="secondary editItem" data-id="${it.id}">Edit</button>
        <button class="danger delItem" data-id="${it.id}">Hapus</button>
      </div>`;
    itemsList.appendChild(li);
  });
  qsa('.delItem').forEach(b => b.addEventListener('click', ()=>{
    if(!confirm('Hapus item?')) return;
    data.items = data.items.filter(x=>x.id!==b.dataset.id);
    saveData(data);
    renderItemsAdmin();
  }));
  qsa('.editItem').forEach(b => b.addEventListener('click', ()=>{
    const it = data.items.find(x=>x.id===b.dataset.id);
    populateItemForm(it.id);
  }));
}

// Admin forms
qs('#musicForm').addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const editId = ev.currentTarget.dataset.edit;
  const title = qs('#musicTitle').value.trim();
  const artist = qs('#musicArtist').value.trim();
  const url = qs('#musicUrl').value.trim();
  if(!title || !url) return alert('Judul dan URL wajib');
  if(editId){
    const m = data.music.find(x=>x.id===editId);
    if(m){ m.title = title; m.artist = artist; m.url = url; }
    delete ev.currentTarget.dataset.edit;
  } else data.music.push({ id: id(), title, artist, url });
  saveData(data);
  qs('#musicForm').reset();
  renderMusicAdmin();
});
qs('#videoForm').addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const editId = ev.currentTarget.dataset.edit;
  const title = qs('#videoTitle').value.trim();
  const url = qs('#videoUrl').value.trim();
  if(!title || !url) return alert('Judul dan URL wajib');
  if(editId){
    const v = data.videos.find(x=>x.id===editId);
    if(v){ v.title = title; v.url = url; }
    delete ev.currentTarget.dataset.edit;
  } else data.videos.push({ id: id(), title, url });
  saveData(data);
  qs('#videoForm').reset();
  renderVideoAdmin();
});
qs('#itemForm').addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const editId = qs('#itemId').value;
  const name = qs('#itemName').value.trim();
  const price = Number(qs('#itemPrice').value) || 0;
  const menu = qs('#itemMenu').value;
  const desc = qs('#itemDesc').value.trim();
  const image = qs('#itemImage').value.trim();
  if(!name) return alert('Nama wajib');
  if(editId){
    const it = data.items.find(x=>x.id===editId);
    if(it){ it.name=name; it.price=price; it.menu=menu; it.desc=desc; it.image=image; }
  } else {
    data.items.push({ id: id(), name, price, menu, desc, image });
  }
  saveData(data);
  qs('#itemForm').reset();
  qs('#itemId').value = '';
  renderItemsAdmin();
});
qs('#itemResetBtn').addEventListener('click', ()=>{
  qs('#itemForm').reset();
  qs('#itemId').value = '';
});

function populateItemForm(idVal){
  const it = data.items.find(x=>x.id===idVal);
  if(!it) return;
  qs('#itemId').value = it.id;
  qs('#itemName').value = it.name;
  qs('#itemPrice').value = it.price;
  qs('#itemMenu').value = it.menu;
  qs('#itemDesc').value = it.desc || '';
  qs('#itemImage').value = it.image || '';
  openModal(adminModal);
  adminControls.classList.remove('hidden');
}

// export / import / reset
qs('#exportBtn').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'zee-web-config.json'; a.click();
  URL.revokeObjectURL(url);
});
qs('#importFile').addEventListener('change', (ev)=>{
  const f = ev.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const parsed = JSON.parse(reader.result);
      if(typeof parsed === 'object' && parsed.music && parsed.videos && parsed.items){
        if(confirm('Impor akan menimpa data saat ini. Lanjutkan?')){
          data = parsed;
          saveData(data);
          renderAdminLists();
          alert('Impor berhasil');
        }
      } else alert('Format JSON tidak sesuai');
    }catch(e){ alert('Gagal membaca file JSON'); }
  };
  reader.readAsText(f);
});
qs('#clearDataBtn').addEventListener('click', ()=>{
  if(!confirm('Reset semua data ke default?')) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ORDERS_KEY);
  data = loadData();
  renderAdminLists();
  alert('Data direset');
});

// helpers
function createVideoEmbed(url){
  // YouTube detection
  try{
    const el = document.createElement('div');
    if(/(?:youtube\.com\/watch\?v=|youtu\.be\/)/i.test(url)){
      // extract id
      let vid = '';
      const m = url.match(/v=([^&]+)/);
      if(m) vid = m[1];
      else {
        const m2 = url.match(/youtu\.be\/([^?]+)/);
        if(m2) vid = m2[1];
      }
      const iframe = document.createElement('iframe');
      iframe.width = '100%';
      iframe.height = '240';
      iframe.src = `https://www.youtube.com/embed/${vid}`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      return iframe;
    } else {
      const video = document.createElement('video');
      video.width = '100%';
      video.height = 240;
      video.controls = true;
      const src = document.createElement('source');
      src.src = url;
      video.appendChild(src);
      return video;
    }
  } catch(e){
    const p = document.createElement('p'); p.textContent = 'Media tidak dapat ditampilkan';
    return p;
  }
}

function escape(s){ return String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])) }
function formatNumber(n){ return Number(n).toLocaleString('id-ID') }

// simple router
qsa('.nav-link').forEach(a => a.addEventListener('click', (ev)=>{
  ev.preventDefault();
  const r = a.dataset.route;
  renderRoute(r);
}));

// initial
renderRoute('home');

// small exposure for debug
window.ZEE_WEB = {
  getData: ()=>data,
  save: ()=>{ saveData(data); alert('disimpan'); }
};