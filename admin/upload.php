<?php
define('OB_ADMIN', true);
session_name('ob_sess');
session_start();
require 'config.php';

header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['admin'])) {
    echo json_encode(['error' => 'Não autorizado']); exit;
}

$f = $_FILES['image'] ?? null;
if (!$f || $f['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => 'Nenhum arquivo recebido.']); exit;
}

$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mime     = $finfo->file($f['tmp_name']);
$allowed  = ['image/jpeg','image/jpg','image/png','image/webp','image/gif'];

if (!in_array($mime, $allowed)) {
    echo json_encode(['error' => 'Tipo não permitido. Use JPG, PNG ou WEBP.']); exit;
}
if ($f['size'] > 5 * 1024 * 1024) {
    echo json_encode(['error' => 'Arquivo muito grande (máx. 5 MB).']); exit;
}

$ext      = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
$base     = strtolower(pathinfo($f['name'], PATHINFO_FILENAME));
$base     = preg_replace('/[^a-z0-9\-\_]/', '-', $base);
$base     = trim(preg_replace('/-+/', '-', $base), '-');
$filename = $base . '.' . $ext;
$dest     = IMG_BLOG . '/' . $filename;

if (!move_uploaded_file($f['tmp_name'], $dest)) {
    echo json_encode(['error' => 'Falha ao salvar no servidor.']); exit;
}

// Se um post foi informado, atualiza a imagem de capa nele
$post = basename($_POST['post'] ?? '');
if ($post && array_key_exists($post, $BLOG_POSTS)) {
    $postPath = PAGES_DIR . '/' . $post;
    if (file_exists($postPath) && is_writable($postPath)) {
        $ph = file_get_contents($postPath);
        $ph = preg_replace(
            '/(<div class="art-hero-img">\s*<img[^>]+src=")[^"]+(")/s',
            '$1../images/blog/' . $filename . '$2',
            $ph, 1
        );
        file_put_contents($postPath, $ph);
    }
}

echo json_encode(['success' => true, 'filename' => $filename]);
