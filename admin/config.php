<?php
defined('OB_ADMIN') or die('');

define('ADMIN_EMAIL', 'oilbrasquimica@gmail.com');
define('ADMIN_PASS',  'SiteBlog20#26');
define('SITE_ROOT',   realpath(__DIR__ . '/..'));
define('PAGES_DIR',   SITE_ROOT . '/pages');
define('IMG_BLOG',    SITE_ROOT . '/images/blog');

$BLOG_POSTS = [
    'blog-fluido-ideal.html'  => ['title' => 'Como escolher o fluído ideal para usinagem',              'tag' => 'Usinagem'],
    'blog-desgaste.html'      => ['title' => 'Redução de desgaste em operações de estampagem',          'tag' => 'Estampagem'],
    'blog-boas-praticas.html' => ['title' => 'Boas práticas de limpeza industrial',                     'tag' => 'Manutenção'],
    'blog-usinagem.html'      => ['title' => 'Como calcular o custo real do fluido de corte',           'tag' => 'Gestão'],
    'blog-estampagem.html'    => ['title' => 'Fluidos biodegradáveis: mito ou realidade?',              'tag' => 'Sustentabilidade'],
    'blog-limpeza.html'       => ['title' => 'Controle de concentração: por que monitorar o fluido?',  'tag' => 'Qualidade'],
];
