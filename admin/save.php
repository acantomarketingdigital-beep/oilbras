<?php
define('OB_ADMIN', true);
session_name('ob_sess');
session_start();
require 'config.php';

if (empty($_SESSION['admin']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php'); exit;
}

$file = basename($_POST['file'] ?? '');
if (!$file || !array_key_exists($file, $BLOG_POSTS)) {
    header('Location: index.php'); exit;
}

$filepath = PAGES_DIR . '/' . $file;
if (!file_exists($filepath)) {
    die('Arquivo não encontrado.');
}

$html  = file_get_contents($filepath);
$title = trim($_POST['title'] ?? '');
$tag   = trim($_POST['tag']   ?? '');
$time  = max(1, (int)($_POST['time'] ?? 5));
$body  = $_POST['body'] ?? '';

// Título
$html = preg_replace(
    '/(<h1[^>]*>).*?(<\/h1>)/s',
    '$1' . $title . '$2',
    $html, 1
);

// Tag
$html = preg_replace(
    '/(<span class="art-tag">).*?(<\/span>)/',
    '$1' . $tag . '$2',
    $html, 1
);

// Tempo de leitura
$html = preg_replace(
    '/\d+\s*min de leitura/',
    $time . ' min de leitura',
    $html, 1
);

// Corpo do artigo (entre art-body e art-cta)
$html = preg_replace(
    '/(<div class="art-body">).*?(<div class="art-cta">)/s',
    '$1' . "\n\n        " . $body . "\n\n        " . '$2',
    $html, 1
);

file_put_contents($filepath, $html);
header('Location: edit.php?f=' . urlencode($file) . '&saved=1');
exit;
