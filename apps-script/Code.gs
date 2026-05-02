/**
 * Portal Garage Band — Backend Apps Script
 * Endpoints (JSONP):
 *   ?action=listFolders&parentId=<id>&callback=cb   -> { folders: [{id,name}] }
 *   ?action=listFiles&parentId=<id>&callback=cb     -> { files:   [{id,name,mimeType}] }
 *
 * Como publicar:
 *   1. Cole este código em script.google.com (novo projeto).
 *   2. Implantar > Nova implantação > Tipo "App da Web".
 *   3. Executar como: "Eu". Quem tem acesso: "Qualquer pessoa".
 *   4. Copie a URL gerada e cole em js/config.js (APPS_SCRIPT_URL).
 *
 * Como sempre que alterar, faça uma NOVA implantação (ou "Gerenciar implantações" > editar > Nova versão).
 */

function doGet(e) {
  const params = (e && e.parameter) || {};
  const callback = params.callback || "";
  let payload;
  try {
    const action = params.action;
    const parentId = params.parentId;
    if (!parentId) throw new Error("parentId é obrigatório");

    if (action === "listFolders") {
      payload = { folders: listFolders_(parentId) };
    } else if (action === "listFiles") {
      payload = { files: listFiles_(parentId) };
    } else {
      throw new Error("action inválido: use listFolders ou listFiles");
    }
  } catch (err) {
    payload = { error: String(err && err.message || err) };
  }
  return reply_(payload, callback);
}

function reply_(obj, callback) {
  const json = JSON.stringify(obj);
  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function listFolders_(parentId) {
  const parent = DriveApp.getFolderById(parentId);
  const it = parent.getFolders();
  const out = [];
  while (it.hasNext()) {
    const f = it.next();
    out.push({ id: f.getId(), name: f.getName() });
  }
  out.sort(function (a, b) { return a.name.localeCompare(b.name, "pt-BR"); });
  return out;
}

function listFiles_(parentId) {
  const parent = DriveApp.getFolderById(parentId);
  const it = parent.getFiles();
  const out = [];
  while (it.hasNext()) {
    const f = it.next();
    out.push({
      id: f.getId(),
      name: f.getName(),
      mimeType: f.getMimeType()
    });
  }
  out.sort(function (a, b) { return a.name.localeCompare(b.name, "pt-BR"); });
  return out;
}
