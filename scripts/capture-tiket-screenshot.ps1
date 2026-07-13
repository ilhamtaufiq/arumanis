$ErrorActionPreference = "Continue"
$env:PINCHTAB_TOKEN = "7fbbec083577e863def124bfbeafb195c1b8f94158e05211"
$ss = "C:\laragon\www\bun\docs\assets\screenshots"
$outShot = Join-Path $ss "tiket-live-01.png"
New-Item -ItemType Directory -Force -Path $ss | Out-Null

$email = $env:ARUMANIS_LOGIN_EMAIL
$pass = $env:ARUMANIS_LOGIN_PASSWORD
if (-not $email -or -not $pass) {
  Write-Error "Set ARUMANIS_LOGIN_EMAIL dan ARUMANIS_LOGIN_PASSWORD."
  exit 1
}

pinchtab server restart 2>&1 | Out-Null
Start-Sleep -Seconds 3
$env:PINCHTAB_SESSION = pinchtab session create --agent-id tiket-shot

pinchtab nav "https://arumanis.cianjur.space/sign-in" --snap --dismiss-banners 2>&1 | Out-Null
Start-Sleep -Seconds 3
pinchtab fill e2 $email --snap-diff 2>&1 | Out-Null
pinchtab fill e4 $pass --snap-diff 2>&1 | Out-Null
pinchtab click e6 --wait-nav --snap-diff --dismiss-banners 2>&1 | Out-Null
Start-Sleep -Seconds 6
pinchtab wait --url "**/dashboard**" --timeout 30000 2>&1 | Out-Null

pinchtab nav "https://arumanis.cianjur.space/tiket" --snap 2>&1 | Out-Null
Start-Sleep -Seconds 4
pinchtab wait --load network-idle --timeout 15000 2>&1 | Out-Null
pinchtab screenshot -o $outShot 2>&1 | Out-Host

if (Test-Path $outShot) {
  Write-Host "SCREENSHOT_OK $outShot"
} else {
  Write-Host "SCREENSHOT_FAIL"
  exit 1
}