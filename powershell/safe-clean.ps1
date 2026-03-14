<#
.SYNOPSIS
  Performs safe cleanup of temporary and cache data.
.DESCRIPTION
  Removes temp files, Edge cache, and runs component cleanup.
  Does not remove core system files.
#>

[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
  [switch]$SkipComponentCleanup
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
  Write-Host "[CLEAN] $Message" -ForegroundColor Magenta
}

$targets = @(
  "$env:TEMP\*",
  "$env:LOCALAPPDATA\Temp\*",
  "C:\Windows\Temp\*",
  "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache\*"
)

Write-Step "Preparing to clean temporary/cache locations"
foreach ($target in $targets) {
  if ($PSCmdlet.ShouldProcess($target, "Remove temporary files")) {
    Remove-Item -Path $target -Recurse -Force -ErrorAction SilentlyContinue
  }
}

if (-not $SkipComponentCleanup) {
  $principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
  $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

  if ($isAdmin) {
    Write-Step "Running DISM component cleanup"
    DISM /Online /Cleanup-Image /StartComponentCleanup | Out-Null
  } else {
    Write-Warning "DISM component cleanup requires Administrator privileges; skipped."
  }
}

Write-Step "Safe cleanup complete."
