import { api, fileUrls } from "./api.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const els = {
  status: $("#conn-status"),
  styles: $("#styles-list"),
  right: $("#right-pane"),
  modal: $("#modal"),
  modalClose: $("#modal-close"),
  modalTitle: $("#modal-title"),
  pdf: $("#pdf-frame"),
  audioMusica: $("#audio-musica"),
  audioBack: $("#audio-back"),
};

const state = {
  styles: [], currentStyle: null,
  bands: [], currentBand: null,
  songs: [],
};

// -------- Render helpers --------
function card(label, sub = "") {
  const li = document.createElement("li");
  li.className = "card";
  li.innerHTML = `${label}${sub ? `<span class="meta">${sub}</span>` : ""}`;
  return li;
}
function empty(msg) {
  const d = document.createElement("div");
  d.className = "empty";
  d.textContent = msg;
  return d;
}

function setStatus(text, kind = "") {
  els.status.textContent = text;
  els.status.className = `chip ${kind}`;
}

function renderCrumbs() {
  const parts = [];
  parts.push(`<button data-go="home">Início</button>`);
  if (state.currentStyle) {
    parts.push(`<span class="sep">›</span><button data-go="style">${state.currentStyle.name}</button>`);
  }
  if (state.currentBand) {
    parts.push(`<span class="sep">›</span><span>${state.currentBand.name}</span>`);
  }
  return `<div class="crumbs">${parts.join("")}</div>`;
}

function renderRightShell(title, contentHTML) {
  els.right.innerHTML = `
    ${renderCrumbs()}
    <div class="panel-head"><h2 class="marquee-sign" data-text="${title}">${title}</h2></div>
    <ul class="grid-cards" id="dynamic-list">${contentHTML}</ul>
  `;
  $$("[data-go]", els.right).forEach((b) => b.addEventListener("click", onCrumb));
}

function onCrumb(e) {
  const where = e.currentTarget.dataset.go;
  if (where === "home") goHome();
  else if (where === "style") openStyle(state.currentStyle);
}

// -------- Loaders --------
async function loadStyles() {
  try {
    setStatus("conectando…");
    const data = await api.listStyles();
    const folders = (data.folders || []);
    state.styles = folders;
    els.styles.innerHTML = "";
    if (!folders.length) {
      els.styles.appendChild(empty("Nenhum estilo encontrado."));
    } else {
      folders.forEach((f) => {
        const c = card(f.name);
        c.addEventListener("click", () => openStyle(f));
        els.styles.appendChild(c);
      });
    }
    setStatus("online", "ok");
  } catch (err) {
    console.error(err);
    setStatus("erro de conexão", "err");
    els.styles.innerHTML = "";
    els.styles.appendChild(empty("Falha ao carregar estilos. Confira o Apps Script."));
  }
}

async function openStyle(style) {
  state.currentStyle = style;
  state.currentBand = null;
  $$(".card", els.styles).forEach((c, i) => c.classList.toggle("active", state.styles[i]?.id === style.id));
  renderRightShell("BANDAS", `<li class="skeleton"></li><li class="skeleton"></li><li class="skeleton"></li>`);
  try {
    const data = await api.listBands(style.id);
    state.bands = data.folders || [];
    const list = $("#dynamic-list", els.right);
    list.innerHTML = "";
    if (!state.bands.length) {
      list.replaceWith(empty("Nenhuma banda nesta pasta."));
      return;
    }
    state.bands.forEach((b) => {
      const c = card(b.name);
      c.addEventListener("click", () => openBand(b));
      list.appendChild(c);
    });
  } catch (e) {
    console.error(e);
    $("#dynamic-list", els.right)?.replaceWith(empty("Erro ao carregar bandas."));
  }
}

async function openBand(band) {
  state.currentBand = band;
  renderRightShell("MÚSICAS", `<li class="skeleton"></li><li class="skeleton"></li>`);
  try {
    const data = await api.listSongs(band.id);
    state.songs = data.folders || [];
    const list = $("#dynamic-list", els.right);
    list.innerHTML = "";
    if (!state.songs.length) {
      list.replaceWith(empty("Nenhuma música nesta banda."));
      return;
    }
    state.songs.forEach((s) => {
      const c = card(s.name, "abrir");
      c.addEventListener("click", () => openSong(s));
      list.appendChild(c);
    });
  } catch (e) {
    console.error(e);
    $("#dynamic-list", els.right)?.replaceWith(empty("Erro ao carregar músicas."));
  }
}

async function openSong(song) {
  // Abre modal e busca arquivos da pasta da música
  els.modalTitle.textContent = song.name;
  els.modalTitle.dataset.text = song.name;
  els.modal.hidden = false;
  setTab("letra");
  // limpa
  els.pdf.src = "about:blank";
  els.audioMusica.removeAttribute("src"); els.audioMusica.load();
  els.audioBack.removeAttribute("src"); els.audioBack.load();

  try {
    const data = await api.listFiles(song.id);
    const files = data.files || [];

    // Heurística por nome
    const find = (rx) => files.find((f) => rx.test(f.name.toLowerCase()));
    const pdf = files.find((f) => /\.pdf$/i.test(f.name)) || find(/letra/);
    const back =
      find(/back[\s_-]*track|backing|playback/) ||
      files.filter((f) => /\.(mp3|m4a|wav|ogg)$/i.test(f.name))[1];
    const musica =
      find(/^(?!.*back).*musica|^(?!.*back).*m[uú]sica|original|full/) ||
      files.find((f) => /\.(mp3|m4a|wav|ogg)$/i.test(f.name) && f !== back);

    if (pdf) els.pdf.src = fileUrls(pdf.id).pdf;
    if (musica) { els.audioMusica.src = fileUrls(musica.id).direct; }
    if (back) { els.audioBack.src = fileUrls(back.id).direct; }
  } catch (e) {
    console.error(e);
  }
}

function setTab(name) {
  $$(".tab", els.modal).forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
  $$(".pane", els.modal).forEach((p) => p.classList.toggle("active", p.dataset.pane === name));
  // pausa áudios não visíveis
  if (name !== "musica") els.audioMusica.pause();
  if (name !== "back") els.audioBack.pause();
}

function closeModal() {
  els.modal.hidden = true;
  els.audioMusica.pause(); els.audioBack.pause();
  els.pdf.src = "about:blank";
}

function goHome() {
  state.currentStyle = null; state.currentBand = null;
  $$(".card", els.styles).forEach((c) => c.classList.remove("active"));
  els.right.innerHTML = `
    <div id="welcome" class="welcome">
      <div class="neon-frame">
        <img src="assets/portal-logo.jpg" alt="Portal Garage Band Mário Cravo" />
      </div>
      <h2 class="marquee-sign big" data-text="PORTAL GARAGE BAND">PORTAL GARAGE BAND</h2>
      <h3 class="marquee-sign sub" data-text="MÁRIO CRAVO">MÁRIO CRAVO</h3>
      <p class="hint">← Escolha um estilo para começar</p>
    </div>`;
}

// -------- Eventos --------
els.modalClose.addEventListener("click", closeModal);
els.modal.addEventListener("click", (e) => { if (e.target === els.modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
$$(".tab", els.modal).forEach((t) => t.addEventListener("click", () => setTab(t.dataset.tab)));

loadStyles();
