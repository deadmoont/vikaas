# Stops the background dev server started by `npm start` (scripts/start.ps1).
# Usage:  npm run stop
#
# Plain ASCII only - see the note in start.ps1 for why.

$ErrorActionPreference = "Stop"

function Test-Admin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Stopping a process started by an elevated session generally needs
# elevation too, so this self-elevates the same way start.ps1 does.
if (-not (Test-Admin)) {
    Write-Host "Elevation required to stop the background server - requesting admin rights..." -ForegroundColor Yellow
    $scriptPath = $MyInvocation.MyCommand.Path
    Start-Process powershell -Verb RunAs -ArgumentList @(
        "-ExecutionPolicy", "Bypass", "-File", "`"$scriptPath`""
    ) -WorkingDirectory "$PSScriptRoot\.."
    exit
}

Set-Location "$PSScriptRoot\.."

$pidFile = ".dev-server.pid"

if (Test-Path $pidFile) {
    $targetId = Get-Content $pidFile -ErrorAction SilentlyContinue
    if ($targetId -and (Get-Process -Id $targetId -ErrorAction SilentlyContinue)) {
        Stop-Process -Id $targetId -Force
        Write-Host "Stopped the dev server (PID $targetId)." -ForegroundColor Green
    } else {
        Write-Host "dev-server.pid pointed at a process that's already gone." -ForegroundColor Yellow
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "No .dev-server.pid found - nothing tracked as running via 'npm start'." -ForegroundColor Yellow
}

# Fallback: if anything (tracked or not) is still holding port 80/443,
# offer to clear it too, since that's the actual symptom most people care
# about (443 is used once HTTPS is set up via `npm run setup-https`).
$holders = Get-NetTCPConnection -LocalPort 80, 443 -ErrorAction SilentlyContinue |
    Where-Object { $_.State -eq "Listen" } |
    ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue } |
    Where-Object { $_.ProcessName -eq "node" } |
    Sort-Object Id -Unique
$holders | ForEach-Object {
    Write-Host "Port 80/443 is still held by a Node process (PID $($_.Id)) - stopping it too." -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force
}

Start-Sleep -Seconds 3
