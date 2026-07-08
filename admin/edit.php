<?php
define('OB_ADMIN', true);
session_name('ob_sess');
session_start();
require 'config.php';

if (empty($_SESSION['admin'])) { header('Location: index.php'); exit; }

$file = basename($_GET['f'] ?? '');
if (!$file || !array_key_exists($file, $BLOG_POSTS)) { header('Location: index.php'); exit; }

$filepath = PAGES_DIR . '/' . $file;
if (!file_exists($filepath)) { die('Arquivo não encontrado.'); }

$html = file_get_contents($filepath);

preg_match('/<h1[^>]*>(.*?)<\/h1>/s', $html, $m);
$title = $m[1] ?? '';

preg_match('/<span class="art-tag">(.*?)<\/span>/', $html, $m);
$tag = $m[1] ?? '';

preg_match('/(\d+)\s*min de leitura/', $html, $m);
$time = $m[1] ?? '5';

preg_match('/<div class="art-hero-img">\s*<img[^>]+src="[^"]*\/([^"\/]+)"/s', $html, $m);
$image = $m[1] ?? '';

preg_match('/<div class="art-body">(.*?)<div class="art-cta">/s', $html, $m);
$body = isset($m[1]) ? trim($m[1]) : '';

$saved = isset($_GET['saved']);
$postInfo = $BLOG_POSTS[$file];
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Editar — <?= htmlspecialchars($postInfo['title']) ?></title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f4f6;color:#1f2937;padding-bottom:80px}
    .topbar{background:#901e78;color:#fff;padding:15px 28px;display:flex;align-items:center;gap:14px}
    .topbar a{color:rgba(255,255,255,.8);text-decoration:none;font-size:13px}
    .topbar a:hover{color:#fff}
    .topbar-title{font-size:15px;font-weight:700;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .wrap{max-width:820px;margin:0 auto;padding:32px 24px}
    .ok-bar{background:#dcfce7;border:1px solid #bbf7d0;color:#16a34a;padding:12px 16px;border-radius:8px;font-size:14px;margin-bottom:24px}
    .form-group{margin-bottom:22px}
    label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:7px}
    .hint{font-size:11px;color:#9ca3af;margin-top:5px}
    input[type=text],input[type=number]{width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;outline:none;background:#fff;transition:border-color .2s}
    input:focus{border-color:#901e78}
    .row2{display:grid;grid-template-columns:1fr 140px;gap:16px}

    /* Editor */
    .editor-wrap{border:1.5px solid #d1d5db;border-radius:8px;overflow:hidden;background:#fff}
    .toolbar{display:flex;gap:4px;padding:8px 10px;background:#f9fafb;border-bottom:1px solid #e5e7eb;flex-wrap:wrap}
    .tb{background:#fff;border:1px solid #d1d5db;border-radius:5px;padding:5px 12px;font-size:13px;cursor:pointer;color:#374151;font-weight:600;line-height:1}
    .tb:hover{background:#f3f4f6}
    #editor{min-height:340px;padding:18px 20px;font-size:15px;line-height:1.85;outline:none}
    #editor h2{font-size:20px;font-weight:800;margin:32px 0 10px;padding-top:8px;border-top:2px solid rgba(132,194,37,.3);color:#901e78}
    #editor h3{font-size:17px;font-weight:700;margin:22px 0 8px;color:#901e78}
    #editor p{margin-bottom:16px;color:#374151}
    #editor ul{margin:0 0 16px 22px}
    #editor li{margin-bottom:6px;color:#374151}

    /* Image */
    .img-box{background:#fff;border-radius:10px;padding:22px;border:1.5px solid #e5e7eb;margin-bottom:22px}
    .img-box label{margin-bottom:10px}
    .img-current{display:flex;align-items:center;gap:14px;margin-bottom:14px}
    .img-current img{width:90px;height:60px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb}
    .img-current span{font-size:13px;color:#6b7280}
    .img-current strong{color:#374151}
    .img-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    .btn-img{background:#84c225;color:#fff;border:none;padding:9px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer}
    .img-res{margin-top:10px;font-size:13px}
    .img-res.ok{color:#16a34a}.img-res.err{color:#dc2626}

    /* Save bar */
    .save-bar{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e5e7eb;padding:14px 28px;display:flex;justify-content:flex-end;gap:12px;box-shadow:0 -2px 14px rgba(0,0,0,.07);z-index:100}
    .btn-save{background:#901e78;color:#fff;border:none;padding:12px 36px;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer}
    .btn-save:hover{background:#7a1a66}
    .btn-cancel{background:#f3f4f6;color:#374151;border:1px solid #d1d5db;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}

    @media(max-width:600px){.row2{grid-template-columns:1fr}}
  </style>
</head>
<body>

<div class="topbar">
  <a href="index.php">← Painel</a>
  <span class="topbar-title"><?= htmlspecialchars($postInfo['title']) ?></span>
</div>

<div class="wrap">
  <?php if ($saved): ?>
  <div class="ok-bar">✓ Artigo salvo com sucesso!</div>
  <?php endif; ?>

  <form id="mainForm" method="POST" action="save.php">
    <input type="hidden" name="file" value="<?= htmlspecialchars($file) ?>">
    <input type="hidden" name="body" id="bodyInput">

    <div class="form-group">
      <label>Título do Artigo</label>
      <input type="text" name="title" value="<?= htmlspecialchars($title) ?>" required>
    </div>

    <div class="row2">
      <div class="form-group">
        <label>Tag / Categoria</label>
        <input type="text" name="tag" value="<?= htmlspecialchars($tag) ?>">
      </div>
      <div class="form-group">
        <label>Tempo de Leitura (min)</label>
        <input type="number" name="time" value="<?= htmlspecialchars($time) ?>" min="1" max="99">
      </div>
    </div>

    <div class="form-group">
      <label>Conteúdo do Artigo</label>
      <div class="editor-wrap">
        <div class="toolbar">
          <button type="button" class="tb" onclick="fmt('formatBlock','h2')">H2</button>
          <button type="button" class="tb" onclick="fmt('formatBlock','h3')">H3</button>
          <button type="button" class="tb" onclick="fmt('formatBlock','p')">P</button>
          <button type="button" class="tb" onclick="fmt('bold')"><b>N</b></button>
          <button type="button" class="tb" onclick="fmt('italic')"><i>I</i></button>
          <button type="button" class="tb" onclick="fmt('insertUnorderedList')">• Lista</button>
          <button type="button" class="tb" onclick="addLink()">🔗 Link</button>
          <button type="button" class="tb" onclick="fmt('removeFormat')" style="color:#dc2626">✕</button>
        </div>
        <div id="editor" contenteditable="true"><?= $body ?></div>
      </div>
      <p class="hint">H2 = título de seção · H3 = subtópico · P = parágrafo · N = negrito</p>
    </div>
  </form>

  <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:7px;">Imagem de Capa</label>
  <div class="img-box">
    <?php if ($image): ?>
    <div class="img-current">
      <img src="../images/blog/<?= htmlspecialchars($image) ?>" id="imgPreview" alt="">
      <span>Atual: <strong id="imgName"><?= htmlspecialchars($image) ?></strong></span>
    </div>
    <?php endif; ?>
    <p style="font-size:13px;color:#6b7280;margin-bottom:14px">Selecione uma nova imagem para substituir a capa deste artigo (JPG, PNG ou WEBP).</p>
    <div class="img-row">
      <input type="file" id="imgFile" accept="image/*">
      <button type="button" class="btn-img" onclick="uploadImg()">Enviar e Aplicar</button>
    </div>
    <div class="img-res" id="imgRes"></div>
  </div>
</div>

<div class="save-bar">
  <a href="index.php" class="btn-cancel">Cancelar</a>
  <button type="button" class="btn-save" onclick="saveForm()">Salvar Artigo</button>
</div>

<script>
function fmt(cmd, val) {
  document.getElementById('editor').focus();
  document.execCommand(cmd, false, val || null);
}
function addLink() {
  var url = prompt('URL do link (ex: https://...)');
  if (url) { document.getElementById('editor').focus(); document.execCommand('createLink', false, url); }
}
function saveForm() {
  document.getElementById('bodyInput').value = document.getElementById('editor').innerHTML;
  document.getElementById('mainForm').submit();
}
function uploadImg() {
  var f = document.getElementById('imgFile').files[0];
  var r = document.getElementById('imgRes');
  if (!f) { r.textContent = 'Selecione uma imagem.'; r.className = 'img-res err'; return; }
  var fd = new FormData();
  fd.append('image', f);
  fd.append('post', <?= json_encode($file) ?>);
  r.textContent = 'Enviando...'; r.className = 'img-res';
  fetch('upload.php', { method: 'POST', body: fd })
    .then(x => x.json())
    .then(d => {
      if (d.success) {
        r.textContent = '✓ Imagem "' + d.filename + '" aplicada!'; r.className = 'img-res ok';
        var p = document.getElementById('imgPreview'); if (p) p.src = '../images/blog/' + d.filename + '?t=' + Date.now();
        var n = document.getElementById('imgName'); if (n) n.textContent = d.filename;
      } else { r.textContent = '✗ ' + d.error; r.className = 'img-res err'; }
    }).catch(() => { r.textContent = '✗ Erro de conexão.'; r.className = 'img-res err'; });
}
</script>
</body>
</html>
