# One-command setup + launch: elevates itself (one UAC prompt) if needed,
# makes sure the hakarrrank.com hosts entry exists, makes sure a locally
# trusted HTTPS cert exists (installing Chocolatey and/or mkcert first if
# either is missing - see setup-https.js), then starts the dev server as a
# fully DETACHED background process (not attached to any console window -
# see the note below) so it opens at https://hakarrrank.com with no port in
# the URL and keeps running even if every terminal window you have open
# gets closed. Stop it again with `npm run stop`.
#
# This is the ONE command anyone who clones this repo needs to run (after
# `npm install`) - no separate choco/mkcert/setup-https steps.
#
# Usage:  npm start   (which runs: powershell -File scripts/start.ps1)
#
# Plain ASCII only in this file on purpose - Windows PowerShell 5.1 reads
# .ps1 files with its system ANSI codepage by default, not UTF-8, so any
# non-ASCII character (em dashes, curly quotes, ...) can silently corrupt
# later string literals and break the parser.

$ErrorActionPreference = "Stop"

function Test-Admin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Admin)) {
    Write-Host "Elevation required (binding port 80/443 + editing the hosts file) - requesting admin rights..." -ForegroundColor Yellow
    $scriptPath = $MyInvocation.MyCommand.Path
    Start-Process powershell -Verb RunAs -ArgumentList @(
        "-ExecutionPolicy", "Bypass", "-File", "`"$scriptPath`""
    ) -WorkingDirectory "$PSScriptRoot\.."
    Write-Host "Approve the UAC prompt in the window that just opened."
    Write-Host "That window will close itself once the server is running in the background - you don't need to keep it open."
    exit
}

Set-Location "$PSScriptRoot\.."

$pidFile = ".dev-server.pid"
$logFile = "dev-server.log"
$errFile = "dev-server.err.log"

# Stop any previous background instance first, so re-running `npm start`
# cleanly restarts rather than leaving an orphaned duplicate.
if (Test-Path $pidFile) {
    $oldProcId = Get-Content $pidFile -ErrorAction SilentlyContinue
    if ($oldProcId) {
        Stop-Process -Id $oldProcId -Force -ErrorAction SilentlyContinue
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

# Also free port 80/443 if something unrelated is still squatting on it
# from an earlier run that didn't get stopped cleanly (e.g. via Task Manager).
$stale = Get-NetTCPConnection -LocalPort 80, 443 -ErrorAction SilentlyContinue |
    Where-Object { $_.State -eq "Listen" } |
    ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue }
$stale | Where-Object { $_.ProcessName -eq "node" } | Sort-Object Id -Unique | ForEach-Object {
    Write-Host "Stopping a stray Node process already on port 80/443 (PID $($_.Id))..." -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force
    Start-Sleep -Milliseconds 500
}

npm run setup-host

# Installs Chocolatey + mkcert if either is missing, then generates the
# cert (skips straight past all of that if certs/ already has one). Not
# fatal if this fails (e.g. no internet on first run) - vite.config.js
# falls back to plain http:// automatically, so the site still comes up.
npm run setup-https
if ($LASTEXITCODE -ne 0) {
    Write-Host "HTTPS setup didn't complete - continuing on plain http:// for now. Re-run 'npm start' once that's sorted." -ForegroundColor Yellow
}

# Launched via `node <vite's own entry file>` directly (not `npm run dev`,
# which is an extra wrapper layer) and with -WindowStyle Hidden, so this is
# a genuinely standalone background process - it is NOT a child of this
# console and does NOT get torn down when this window (or the terminal you
# originally ran `npm start` from) closes. That's the actual fix for
# "closing PowerShell shouldn't stop the site."
Remove-Item $logFile, $errFile -ErrorAction SilentlyContinue
$vitePath = Join-Path (Get-Location) "node_modules\vite\bin\vite.js"
$proc = Start-Process node -ArgumentList "`"$vitePath`"" -WindowStyle Hidden `
    -RedirectStandardOutput $logFile -RedirectStandardError $errFile -PassThru
$proc.Id | Out-File $pidFile -Encoding ascii -NoNewline

Start-Sleep -Seconds 2
$hasCerts = (Test-Path "certs\hakarrrank.com.pem") -and (Test-Path "certs\hakarrrank.com-key.pem")
$siteUrl = if ($hasCerts) { "https://hakarrrank.com/" } else { "http://hakarrrank.com/ (run 'npm run setup-https' for https with no browser warning)" }
Write-Host ""
Write-Host "Dev server running in the background (PID $($proc.Id))." -ForegroundColor Green
Write-Host "  Site:  $siteUrl"
Write-Host "  Logs:  $(Join-Path (Get-Location) $logFile)"
Write-Host "  Stop:  npm run stop"
Write-Host ""
Write-Host "This window (and any other terminal) can be closed now - the site keeps running."
Start-Sleep -Seconds 5
