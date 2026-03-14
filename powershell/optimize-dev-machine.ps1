<#
.SYNOPSIS
  Master entry point for developer workstation optimization.
.DESCRIPTION
  Executes audit -> setup -> cache configuration -> safe cleanup as one operation.
  Run from an elevated PowerShell terminal for full effect.
#>

[CmdletBinding()]
param(
  [switch]$SkipCleanup
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
  Write-Host "[MASTER] $Message" -ForegroundColor Blue
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$auditScript = Join-Path $scriptRoot "audit-system.ps1"
$setupScript = Join-Path $scriptRoot "setup-dev-drive.ps1"
$cacheScript = Join-Path $scriptRoot "configure-dev-caches.ps1"
$cleanScript = Join-Path $scriptRoot "safe-clean.ps1"

foreach ($scriptPath in @($auditScript, $setupScript, $cacheScript, $cleanScript)) {
  if (-not (Test-Path $scriptPath)) {
    throw "Missing required script: $scriptPath"
  }
}

Write-Step "1/4 Running system audit"
& $auditScript

Write-Step "2/4 Creating D: developer structure + TEMP/TMP settings"
& $setupScript

Write-Step "3/4 Redirecting development caches"
& $cacheScript

if (-not $SkipCleanup) {
  Write-Step "4/4 Running safe cleanup"
  & $cleanScript -Confirm:$false
} else {
  Write-Step "Cleanup skipped by request (-SkipCleanup)."
}

Write-Step "Optimization sequence complete."
