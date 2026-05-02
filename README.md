# Portal Garage Band — Mário Cravo

Web app de música com letras (PDF), música (MP3) e back tracking (MP3) servidos a partir de uma pasta do Google Drive, via Apps Script. Hospede no GitHub Pages.

## Estrutura

```
portal-garage-band/
├─ index.html
├─ css/
│  └─ styles.css
├─ js/
│  ├─ config.js      # ID da pasta + URL do Apps Script
│  ├─ api.js         # JSONP para o Apps Script
│  ├─ bg-lasers.js   # canvas com lasers / partículas
│  └─ app.js         # lógica de UI
├─ assets/
│  └─ portal-logo.jpg
├─ apps-script/
│  └─ Code.gs        # backend (cole no script.google.com)
└─ README.md
```

## 1. Organize a pasta no Drive

```
Portal Garage Band (1wE8PTP74rEIkOPIXVqHxy2bCuuRQRaa5)
├─ Rock/
│  ├─ Raul Seixas/
│  │  ├─ Gita/
│  │  │  ├─ letra.pdf
│  │  │  ├─ musica.mp3
│  │  │  └─ backtrack.mp3
│  │  └─ Maluco Beleza/...
│  └─ Titãs/...
├─ Forró/
├─ Samba/
├─ Carnaval/
└─ MPB/
```

A pasta deve estar **compartilhada como "Qualquer pessoa com o link — Leitor"**, para o player tocar os MP3 direto e o PDF abrir no iframe.

> Heurística do app:
> - PDF → primeiro `.pdf` (ou nome contém "letra")
> - **Back tracking** → arquivo cujo nome contém `back`, `backing` ou `playback`
> - **Música** → o outro áudio da pasta

## 2. Publique o Apps Script

1. Abra <https://script.google.com> e crie um projeto.
2. Cole o conteúdo de `apps-script/Code.gs`.
3. **Implantar → Nova implantação → App da Web**
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa**
4. Copie a URL `…/exec` e cole em `js/config.js` se mudar.

> Sempre que editar o `Code.gs`, crie uma **Nova implantação** (ou edite a existente e suba a versão) — a URL não muda.

## 3. Suba no GitHub Pages

```bash
git init
git add .
git commit -m "feat: portal garage band"
git branch -M main
git remote add origin git@github.com:SEU_USER/portal-garage-band.git
git push -u origin main
```

No repositório: **Settings → Pages → Branch: main / root → Save**. Em ~1min sai em `https://SEU_USER.github.io/portal-garage-band/`.

## 4. Configuração

Tudo em `js/config.js`:

```js
export const CONFIG = {
  ROOT_FOLDER_ID: "1wE8PTP74rEIkOPIXVqHxy2bCuuRQRaa5",
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycby.../exec",
};
```

## Recursos visuais

- Lasers + partículas em canvas (`bg-lasers.js`)
- Pisca-pisca (string lights) animado
- Letreiro luminoso estilo neon (`Monoton` + text-shadow em camadas)
- Quadros com bordas grossas e brilho neon pulsante
- Equalizador animado durante reprodução
- Modal com abas (Letra / Música / Back tracking)

## Próximos upgrades sugeridos

- Busca/filtro
- Favoritos (localStorage)
- Modo karaoke (PDF + áudio sincronizados)
- Visualização de waveform com Web Audio API
