$ErrorActionPreference = "Continue"
$env:PINCHTAB_TOKEN = "7fbbec083577e863def124bfbeafb195c1b8f94158e05211"
$ss = "C:\laragon\www\bun\docs\assets\screenshots"

pinchtab server restart 2>&1 | Out-Null
Start-Sleep -Seconds 2
$env:PINCHTAB_SESSION = pinchtab session create --agent-id arumanis-guide2

function Shot($name) {
    $path = Join-Path $ss $name
    pinchtab screenshot -o $path 2>&1 | Out-Host
    Write-Host "SHOT: $name"
}

# Login page
pinchtab nav "https://arumanis.cianjur.space/sign-in" --snap --dismiss-banners 2>&1 | Out-Host
Start-Sleep -Seconds 3
pinchtab snap -i -c 2>&1 | Out-Host
$email = $env:ARUMANIS_LOGIN_EMAIL
$pass = $env:ARUMANIS_LOGIN_PASSWORD
if (-not $email -or -not $pass) { throw "Set ARUMANIS_LOGIN_EMAIL and ARUMANIS_LOGIN_PASSWORD" }
pinchtab fill e2 $email --snap-diff 2>&1 | Out-Host
pinchtab fill e4 $pass --snap-diff 2>&1 | Out-Host
pinchtab click e6 --wait-nav --snap-diff --dismiss-banners 2>&1 | Out-Host
Start-Sleep -Seconds 6
pinchtab wait --url "**/dashboard**" --timeout 30000 2>&1 | Out-Host
pinchtab snap -i -c 2>&1 | Out-Host
pinchtab text --full 2>&1 | Select-Object -First 30 | Out-Host
Shot "nav-01-sidebar.png"

$routes = @(
    @{ url = "https://arumanis.cianjur.space/dashboard"; file = "dashboard-01.png" },
    @{ url = "https://arumanis.cianjur.space/kegiatan"; file = "admin-03-kegiatan-pptk.png" },
    @{ url = "https://arumanis.cianjur.space/kegiatan/new"; file = "admin-03-kegiatan-form-pptk.png" },
    @{ url = "https://arumanis.cianjur.space/settings"; file = "admin-01-settings.png" },
    @{ url = "https://arumanis.cianjur.space/pekerjaan"; file = "modul-01-pekerjaan-list.png" },
    @{ url = "https://arumanis.cianjur.space/kontrak"; file = "admin-04-kontrak-list.png" },
    @{ url = "https://arumanis.cianjur.space/users"; file = "admin-02-users.png" },
    @{ url = "https://arumanis.cianjur.space/route-permissions"; file = "admin-02-route-permissions.png" },
    @{ url = "https://arumanis.cianjur.space/roles"; file = "admin-roles.png" },
    @{ url = "https://arumanis.cianjur.space/panduan"; file = "panduan-in-app.png" },
    @{ url = "https://arumanis.cianjur.space/puspen"; file = "puspen-01.png" },
    @{ url = "https://arumanis.cianjur.space/checklist"; file = "modul-checklist.png" },
    @{ url = "https://arumanis.cianjur.space/foto"; file = "modul-foto.png" },
    @{ url = "https://arumanis.cianjur.space/map"; file = "modul-peta.png" },
    @{ url = "https://arumanis.cianjur.space/notifications"; file = "modul-notifikasi.png" }
)

foreach ($r in $routes) {
    pinchtab nav $r.url --snap 2>&1 | Out-Host
    Start-Sleep -Seconds 4
    pinchtab wait --load network-idle --timeout 15000 2>&1 | Out-Host
    $txt = pinchtab text --full 2>&1 | Out-String
    if ($txt -match 'sign-in|MASUK|name@example.com') {
        Write-Host "WARN: still on login for $($r.url)"
    } else {
        Write-Host "OK: $($r.url)"
    }
    Shot $r.file
}

Get-ChildItem $ss | Sort-Object Name | Format-Table Name, Length
Write-Host "DONE"