$ErrorActionPreference = "Continue"
$env:PINCHTAB_TOKEN = "7fbbec083577e863def124bfbeafb195c1b8f94158e05211"
$outJson = "C:\laragon\www\bun\docs\reports\tiket-live-snapshot.json"
$outShot = "C:\laragon\www\bun\docs\assets\screenshots\tiket-live-01.png"
New-Item -ItemType Directory -Force -Path (Split-Path $outJson) | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path $outShot) | Out-Null

$email = $env:ARUMANIS_LOGIN_EMAIL
$pass = $env:ARUMANIS_LOGIN_PASSWORD
if (-not $email -or -not $pass) {
  Write-Error "Set ARUMANIS_LOGIN_EMAIL dan ARUMANIS_LOGIN_PASSWORD sebelum menjalankan skrip ini."
  exit 1
}

pinchtab server restart 2>&1 | Out-Null
Start-Sleep -Seconds 3
$env:PINCHTAB_SESSION = pinchtab session create --agent-id tiket-audit

pinchtab nav "https://arumanis.cianjur.space/sign-in" --snap --dismiss-banners 2>&1 | Out-Null
Start-Sleep -Seconds 3
pinchtab fill e2 $email --snap-diff 2>&1 | Out-Null
pinchtab fill e4 $pass --snap-diff 2>&1 | Out-Null
pinchtab click e6 --snap-diff --dismiss-banners 2>&1 | Out-Null
Start-Sleep -Seconds 6
pinchtab wait --url "**/dashboard**" --timeout 30000 2>&1 | Out-Null

$js = @"
(async () => {
  const all = [];
  let page = 1;
  let last = 1;
  do {
    const r = await fetch('/bff/api/tiket?per_page=100&page=' + page, { credentials: 'include' });
    if (!r.ok) return JSON.stringify({ error: r.status, body: await r.text() });
    const j = await r.json();
    if (Array.isArray(j.data)) all.push(...j.data);
    last = j.meta?.last_page ?? 1;
    page++;
  } while (page <= last);
  const details = [];
  for (const t of all) {
    const dr = await fetch('/bff/api/tiket/' + t.id, { credentials: 'include' });
    if (dr.ok) {
      const dj = await dr.json();
      details.push(dj.data ?? dj);
    } else {
      details.push(t);
    }
  }
  return JSON.stringify({
    captured_at: new Date().toISOString(),
    url: location.href,
    user: document.title,
    total: all.length,
    tickets: details
  });
})()
"@

$apiJson = pinchtab eval $js --await-promise --json 2>&1
$apiJson | Out-File "C:\laragon\www\bun\docs\reports\tiket-raw-eval.json" -Encoding utf8

$parsed = $null
try {
  $obj = $apiJson | ConvertFrom-Json
  if ($obj.result) { $parsed = $obj.result | ConvertFrom-Json }
  elseif ($obj.value) { $parsed = $obj.value | ConvertFrom-Json }
} catch {}

if (-not $parsed) {
  $m = [regex]::Match(($apiJson | Out-String), '\{[\s\S]*\}')
  if ($m.Success) { $parsed = $m.Value | ConvertFrom-Json }
}

if (-not $parsed) {
  Write-Error "Gagal mengambil data API tiket. Cek docs/reports/tiket-raw-eval.json"
  exit 1
}

$pageText = ""
$shotOk = $false
try {
  pinchtab nav "https://arumanis.cianjur.space/tiket" --snap 2>&1 | Out-Null
  Start-Sleep -Seconds 4
  pinchtab wait --load network-idle --timeout 15000 2>&1 | Out-Null
  $pageText = pinchtab text --full 2>&1 | Out-String
  pinchtab screenshot -o $outShot 2>&1 | Out-Null
  $shotOk = Test-Path $outShot
} catch {
  Write-Host "WARN: screenshot/text halaman tiket gagal - data API tetap disimpan."
}

$snapshot = @{
  captured_at = $parsed.captured_at
  source = "https://arumanis.cianjur.space/tiket"
  login_email = $email
  total = $parsed.total
  page_text_excerpt = if ($pageText) { $pageText.Substring(0, [Math]::Min(8000, $pageText.Length)) } else { "" }
  screenshot = if ($shotOk) { $outShot } else { $null }
  tickets = $parsed.tickets
}
[System.IO.File]::WriteAllText($outJson, ($snapshot | ConvertTo-Json -Depth 20), [System.Text.UTF8Encoding]::new($false))
Write-Host "WROTE $outJson"
Write-Host "TICKETS: $($parsed.total)"
if ($shotOk) { Write-Host "SCREENSHOT_OK $outShot" } else { Write-Host "SCREENSHOT_SKIP" }