// Camada de acesso ao Apps Script.
// Usamos JSONP para evitar problemas de CORS com o Apps Script.
import { CONFIG } from "./config.js";

let _cb = 0;
function jsonp(params) {
  return new Promise((resolve, reject) => {
    const cbName = `__pgb_cb_${Date.now()}_${++_cb}`;
    const url = new URL(CONFIG.APPS_SCRIPT_URL);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    url.searchParams.set("callback", cbName);

    const script = document.createElement("script");
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout ao contatar Apps Script"));
    }, 20000);

    function cleanup() {
      clearTimeout(timer);
      delete window[cbName];
      script.remove();
    }

    window[cbName] = (data) => {
      cleanup();
      if (data && data.error) reject(new Error(data.error));
      else resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("Falha de rede ao chamar Apps Script"));
    };
    script.src = url.toString();
    document.head.appendChild(script);
  });
}

export const api = {
  listStyles: () =>
    jsonp({ action: "listFolders", parentId: CONFIG.ROOT_FOLDER_ID }),
  listBands: (styleId) =>
    jsonp({ action: "listFolders", parentId: styleId }),
  listSongs: (bandId) =>
    jsonp({ action: "listFolders", parentId: bandId }),
  listFiles: (songId) =>
    jsonp({ action: "listFiles", parentId: songId }),
};

// URLs diretas para visualização/streaming (pasta pública)
export function fileUrls(fileId, mime) {
  return {
    // Player nativo do Drive (iframe) — preview embutido
    preview: `https://drive.google.com/file/d/${fileId}/preview`,
    // Stream/download direto (funciona para áudio/vídeo)
    direct: `https://drive.google.com/uc?export=download&id=${fileId}`,
    // PDF embed
    pdf: `https://drive.google.com/file/d/${fileId}/preview`,
  };
}
