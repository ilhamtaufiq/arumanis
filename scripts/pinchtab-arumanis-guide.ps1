$ErrorActionPreference = "Continue"
$env:PINCHTAB_TOKEN = "7fbbec083577e863def124bfbeafb195c1b8f94158e05211"
$ss = "C:\laragon\www\bun\docs\assets\screenshots"
New-Item -ItemType Directory -Path $ss -Force | Out-Null

pinchtab server restart 2>&1 | Out-Null
Start-Sleep -Seconds 2

$env:PINCHTAB_SESSION = pinchtab session create --agent-id arumanis-guide
Write-Host "SESSION=$env:PINCHTAB_SESSION"

function Shot($name) {
    $path = Join-Path $ss $name
    pinchtab screenshot -o $path --beyond-viewport 2>&1 | Out-Host
    Write-Host "SHOT: $path"
}

# --- Landing ---
pinchtab nav "https://arumanis.cianjur.space" --snap --block-ads --dismiss-banners 2>&1 | Out-Host
Start-Sleep -Seconds 5
pinchtab wait --load network-idle --timeout 20000 2>&1 | Out-Host
Shot "landing-01-hero.png"
pinchtab snap -i -c 2>&1 | Out-Host

# Scroll to access cards
pinchtab scroll 1200 2>&1 | Out-Host
Start-Sleep -Seconds 2
Shot "landing-02-kartu-akses.png"

# --- Login ---
pinchtab click e7 --wait-nav --snap-diff --dismiss-banners 2>&1 | Out-Host
Start-Sleep -Seconds 3
pinchtab snap -i -c 2>&1 | Out-Host
Shot "auth-01-sign-in.png"

# Find email/password fields
$loginSnap = pinchtab snap -i -c 2>&1 | Out-String
Write-Host $loginSnap

# Try fill by find or common refs
pinchtab find "email" --ref-only 2>&1 | Out-Host
$emailRef = (pinchtab find "email" --ref-only 2>&1 | Select-String -Pattern '^e\d+' | ForEach-Object { $_.Matches.Value } | Select-Object -First 1)
if (-not $emailRef) { $emailRef = "e0" }
$passRef = (pinchtab find "password" --ref-only 2>&1 | Select-String -Pattern '^e\d+' | ForEach-Object { $_.Matches.Value } | Select-Object -First 1)
if (-not $passRef) { $passRef = "e1" }

$email = $env:ARUMANIS_LOGIN_EMAIL
$pass = $env:ARUMANIS_LOGIN_PASSWORD
if (-not $email -or -not $pass) { throw "Set ARUMANIS_LOGIN_EMAIL and ARUMANIS_LOGIN_PASSWORD" }
pinchtab fill $emailRef $email --snap-diff 2>&1 | Out-Host
pinchtab fill $passRef $pass --snap-diff 2>&1 | Out-Host

$submitRef = (pinchtab find "sign in" --ref-only 2>&1 | Select-String -Pattern '^e\d+' | ForEach-Object { $_.Matches.Value } | Select-Object -First 1)
if (-not $submitRef) { $submitRef = (pinchtab find "masuk" --ref-only 2>&1 | Select-String -Pattern '^e\d+' | ForEach-Object { $_.Matches.Value } | Select-Object -First 1) }
Write-Host "SUBMIT=$submitRef"
pinchtab click $submitRef --wait-nav --snap-diff --dismiss-banners --timeout 30000 2>&1 | Out-Host
Start-Sleep -Seconds 5
pinchtab wait --url "**/dashboard**" --timeout 30000 2>&1 | Out-Host
pinchtab snap -i -c 2>&1 | Out-Host
Shot "nav-01-sidebar.png"

# Dashboard
pinchtab nav "https://arumanis.cianjur.space/dashboard" --snap 2>&1 | Out-Host
Start-Sleep -Seconds 4
Shot "dashboard-01.png"
pinchtab text --full 2>&1 | Select-Object -First 40 | Out-Host

# Kegiatan
pinchtab nav "https://arumanis.cianjur.space/kegiatan" --snap 2>&1 | Out-Host
Start-Sleep -Seconds 4
Shot "admin-03-kegiatan-pptk.png"
pinchtab snap -i -c 2>&1 | Out-Host

# Settings kontrak
pinchtab nav "https://arumanis.cianjur.space/settings" --snap 2>&1 | Out-Host
Start-Sleep -Seconds 4
Shot "admin-01-settings.png"

# Pekerjaan
pinchtab nav "https://arumanis.cianjur.space/pekerjaan" --snap 2>&1 | Out-Host
Start-Sleep -Seconds 4
Shot "modul-01-pekerjaan-list.png"

# Kontrak
pinchtab nav "https://arumanis.cianjur.space/kontrak" --snap 2>&1 | Out-Host
Start-Sleep -Seconds 4
Shot "admin-04-kontrak-list.png"

# Publikasi public
pinchtab nav "https://arumanis.cianjur.space/publikasi" --snap 2>&1 | Out-Host
Start-Sleep -Seconds 4
Shot "public-01-publikasi.png"

# Panduan in-app
pinchtab nav "https://arumanis.cianjur.space/panduan" --snap 2>&1 | Out-Host
Start-Sleep -Seconds 3
Shot "panduan-in-app.png"

# Users (admin)
pinchtab nav "https://arumanis.cianjur.space/users" --snap 2>&1 | Out-Host
Start-Sleep -Seconds 4
Shot "admin-02-users.png"

# Route permissions
pinchtab nav "https://arumanis.cianjur.space/route-permissions" --snap 2>&1 | Out-Host
Start-Sleep -Seconds 4
Shot "admin-02-route-permissions.png"

# Puspen
pinchtab nav "https://arumanis.cianjur.space/puspen" --snap 2>&1 | Out-Host
Start-Sleep -Seconds 4
Shot "puspen-01.png"

Write-Host "DONE - screenshots in $ss"
Get-ChildItem $ss | Format-Table Name, Length