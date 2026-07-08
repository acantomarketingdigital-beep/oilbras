<?php
define('OB_ADMIN', true);
session_name('ob_sess');
session_start();
require 'config.php';

if (isset($_GET['logout'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: index.php');
    exit;
}

$error = '';
if (!empty($_POST['email'])) {
    if (trim($_POST['email']) === ADMIN_EMAIL && $_POST['pass'] === ADMIN_PASS) {
        $_SESSION['admin'] = true;
        header('Location: index.php');
        exit;
    }
    $error = 'Email ou senha incorretos.';
}

$logged = !empty($_SESSION['admin']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title><?= $logged ? 'Painel' : 'Login' ?> — Oilbras Admin</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f4f6;color:#1f2937;min-height:100vh}

    /* Login */
    .login-page{display:flex;align-items:center;justify-content:center;min-height:100vh}
    .login-card{background:#fff;border-radius:12px;padding:44px 40px;width:360px;box-shadow:0 4px 28px rgba(0,0,0,.1)}
    .login-logo{text-align:center;margin-bottom:6px;font-size:26px;font-weight:900;color:#901e78;letter-spacing:-.5px}
    .login-sub{text-align:center;font-size:13px;color:#9ca3af;margin-bottom:32px}
    .form-group{margin-bottom:18px}
    label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px}
    input[type=email],input[type=password]{width:100%;padding:11px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;outline:none;transition:border-color .2s}
    input:focus{border-color:#901e78}
    .btn-login{width:100%;padding:13px;background:#901e78;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;margin-top:4px;transition:background .2s}
    .btn-login:hover{background:#7a1a66}
    .err{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:11px 14px;border-radius:8px;font-size:13px;margin-bottom:18px}

    /* Dashboard */
    .topbar{background:#901e78;color:#fff;padding:15px 28px;display:flex;align-items:center;justify-content:space-between}
    .topbar-title{font-size:18px;font-weight:800}
    .topbar a{color:rgba(255,255,255,.8);text-decoration:none;font-size:13px;border:1px solid rgba(255,255,255,.3);padding:6px 14px;border-radius:6px}
    .topbar a:hover{background:rgba(255,255,255,.15)}
    .wrap{max-width:920px;margin:0 auto;padding:36px 24px 60px}
    .sec-title{font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px}
    .posts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px;margin-bottom:48px}
    .post-card{background:#fff;border-radius:10px;padding:20px;border:1.5px solid #e5e7eb}
    .post-tag{font-size:11px;font-weight:700;color:#84c225;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px}
    .post-card h3{font-size:14px;line-height:1.5;margin-bottom:18px;color:#111827}
    .btn-edit{display:inline-block;background:#901e78;color:#fff;padding:8px 20px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none}
    .btn-edit:hover{background:#7a1a66}

    .upload-box{background:#fff;border-radius:10px;padding:24px;border:1.5px solid #e5e7eb}
    .upload-box p{font-size:13px;color:#6b7280;margin-bottom:16px}
    .upload-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    .btn-up{background:#84c225;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer}
    .up-res{margin-top:12px;font-size:13px}
    .up-res.ok{color:#16a34a}.up-res.err{color:#dc2626}
    .img-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
    .chip{font-size:12px;background:#f3f4f6;padding:4px 10px;border-radius:4px;color:#374151}
  </style>
</head>
<body>

<?php if (!$logged): ?>
<div class="login-page">
  <div class="login-card">
    <div class="login-logo">Oilbras</div>
    <div class="login-sub">Painel Administrativo</div>
    <?php if ($error): ?><div class="err"><?= htmlspecialchars($error) ?></div><?php endif; ?>
    <form method="POST">
      <div class="form-group">
        <label>Email</label>
        <input type="email" name="email" required autofocus>
      </div>
      <div class="form-group">
        <label>Senha</label>
        <input type="password" name="pass" required>
      </div>
      <button type="submit" class="btn-login">Entrar</button>
    </form>
  </div>
</div>

<?php else: ?>
<div class="topbar">
  <span class="topbar-title">Oilbras Admin</span>
  <a href="?logout=1">Sair</a>
</div>
<div class="wrap">

  <p class="sec-title">Artigos do Blog</p>
  <div class="posts-grid">
    <?php foreach ($BLOG_POSTS as $file => $info): ?>
    <div class="post-card">
      <div class="post-tag"><?= htmlspecialchars($info['tag']) ?></div>
      <h3><?= htmlspecialchars($info['title']) ?></h3>
      <a href="edit.php?f=<?= urlencode($file) ?>" class="btn-edit">Editar Artigo</a>
    </div>
    <?php endforeach; ?>
  </div>

  <p class="sec-title">Upload de Imagem</p>
  <div class="upload-box">
    <p>Envie imagens de capa para os artigos (JPG, PNG ou WEBP, máx. 5MB). O arquivo ficará disponível em <code>images/blog/</code>.</p>
    <div class="upload-row">
      <input type="file" id="imgFile" accept="image/*">
      <button class="btn-up" onclick="doUpload()">Enviar</button>
    </div>
    <div class="up-res" id="upRes"></div>
    <?php
      $imgs = glob(IMG_BLOG . '/*.{jpg,jpeg,png,webp,gif}', GLOB_BRACE);
      if ($imgs): ?>
    <div class="img-chips">
      <?php foreach ($imgs as $img): ?>
      <span class="chip"><?= htmlspecialchars(basename($img)) ?></span>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>
  </div>

</div>
<script>
function doUpload(){
  var f=document.getElementById('imgFile').files[0];
  var r=document.getElementById('upRes');
  if(!f){r.textContent='Selecione um arquivo.';r.className='up-res err';return;}
  var fd=new FormData();fd.append('image',f);
  r.textContent='Enviando...';r.className='up-res';
  fetch('upload.php',{method:'POST',body:fd}).then(x=>x.json()).then(d=>{
    if(d.success){r.textContent='✓ "'+d.filename+'" enviada!';r.className='up-res ok';document.getElementById('imgFile').value='';}
    else{r.textContent='✗ '+d.error;r.className='up-res err';}
  }).catch(()=>{r.textContent='✗ Erro de conexão.';r.className='up-res err';});
}
</script>
<?php endif; ?>
</body>
</html>
