$env:PINCHTAB_TOKEN = "7fbbec083577e863def124bfbeafb195c1b8f94158e05211"
$ss = "C:\laragon\www\bun\docs\assets\screenshots"
pinchtab server restart 2>&1 | Out-Null
Start-Sleep -Seconds 2
$env:PINCHTAB_SESSION = pinchtab session create --agent-id arumanis-core

function Shot($name) {
    Start-Sleep -Seconds 2
    pinchtab screenshot -o (Join-Path $ss $name) --scale 0.6 2>&1 | Out-Host
}

pinchtab nav "https://arumanis.cianjur.space/sign-in" --dismiss-banners 2>&1 | Out-Null
Start-Sleep -Seconds 2
$email = $env:ARUMANIS_LOGIN_EMAIL
$pass = $env:ARUMANIS_LOGIN_PASSWORD
if (-not $email -or -not $pass) { throw "Set ARUMANIS_LOGIN_EMAIL and ARUMANIS_LOGIN_PASSWORD" }
pinchtab fill e2 $email 2>&1 | Out-Null
pinchtab fill e4 $pass 2>&1 | Out-Null
pinchtab click e6 --wait-nav --dismiss-banners 2>&1 | Out-Null
Start-Sleep -Seconds 8

@(
  @("https://arumanis.cianjur.space/dashboard","dashboard-01.png"),
  @("https://arumanis.cianjur.space/kegiatan","admin-03-kegiatan-pptk.png"),
  @("https://arumanis.cianjur.space/kegiatan/new","admin-03-kegiatan-form-pptk.png"),
  @("https://arumanis.cianjur.space/pekerjaan","modul-01-pekerjaan-list.png"),
  @("https://arumanis.cianjur.space/kontrak","admin-04-kontrak-list.png"),
  @("https://arumanis.cianjur.space/users","admin-02-users.png"),
  @("https://arumanis.cianjur.space/route-permissions","admin-02-route-permissions.png"),
  @("https://arumanis.cianjur.space/roles","admin-roles.png"),
  @("https://arumanis.cianjur.space/foto","modul-foto.png"),
  @("https://arumanis.cianjur.space/map","modul-peta.png")
) | ForEach-Object {
    pinchtab nav $_[0] 2>&1 | Out-Null
    Start-Sleep -Seconds 5
    Shot $_[1]
}

Get-ChildItem $ss | Sort-Object Name | Format-Table Name, Length