<?php
declare(strict_types=1);

function fetchUrl(string $url, int $timeout = 20): string {
  if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'evote.ng-news-test/1.0');
    $resp = curl_exec($ch);
    curl_close($ch);
    return $resp === false ? '' : (string)$resp;
  }
  $ctx = stream_context_create(['http' => [
    'method' => 'GET',
    'timeout' => $timeout,
    'header' => "User-Agent: evote.ng-news-test/1.0\r\nAccept: application/rss+xml, application/xml, text/xml, */*",
    'ignore_errors' => true,
  ]]);
  $resp = @file_get_contents($url, false, $ctx);
  return $resp === false ? '' : (string)$resp;
}

function parseRss(string $xml): array {
  if ($xml === '') return [];
  libxml_use_internal_errors(true);
  $sx = @simplexml_load_string($xml);
  if (!$sx) return [];
  $items = [];
  if (isset($sx->channel->item)) {
    foreach ($sx->channel->item as $it) {
      $title = trim((string)($it->title ?? ''));
      $link = trim((string)($it->link ?? ''));
      if ($title === '' || $link === '') continue;
      $items[] = ['title' => $title, 'url' => $link];
    }
  }
  return $items;
}

$url = $argv[1] ?? 'https://feeds.bbci.co.uk/news/rss.xml';
$xml = fetchUrl($url);
if ($xml === '') {
  fwrite(STDERR, "FAIL: unable to fetch RSS\n");
  exit(1);
}
$items = parseRss($xml);
if (!count($items)) {
  fwrite(STDERR, "FAIL: parsed 0 items\n");
  exit(1);
}
fwrite(STDOUT, "OK: parsed " . count($items) . " items. First title: " . $items[0]['title'] . "\n");

