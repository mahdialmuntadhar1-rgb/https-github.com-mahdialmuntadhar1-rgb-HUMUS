<#
.SYNOPSIS
  Creates an optimized D: developer folder layout and sets TEMP/TMP.
.DESCRIPTION
  Idempotent setup for workstation standardization.
  Machine-level TEMP/TMP requires elevated privileges.
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [string]$DevRoot = "D:\"
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
  Write-Host "[SETUP] $Message" -ForegroundColor Green
}

$paths = @(
  (Join-Path $DevRoot "Dev"),
  (Join-Path $DevRoot "Tools"),
  (Join-Path $DevRoot "Projects"),
  (Join-Path $DevRoot "Workspace"),
  (Join-Path $DevRoot "Temp"),
  (Join-Path $DevRoot "Cache"),
  (Join-Path $DevRoot "Downloads"),
  (Join-Path $DevRoot "Tools\PowerShell"),
  (Join-Path $DevRoot "Tools\AuditReports")
)

Write-Step "Creating folder structure under $DevRoot"
foreach ($path in $paths) {
  if ($PSCmdlet.ShouldProcess($path, "Create directory")) {
    New-Item -ItemType Directory -Force -Path $path | Out-Null
  }
}

Write-Step "Setting user TEMP/TMP to D:\Temp"
[Environment]::SetEnvironmentVariable("TEMP", "D:\Temp", "User")
[Environment]::SetEnvironmentVariable("TMP", "D:\Temp", "User")

$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($isAdmin) {
  Write-Step "Setting machine TEMP/TMP to D:\Temp"
  [Environment]::SetEnvironmentVariable("TEMP", "D:\Temp", "Machine")
  [Environment]::SetEnvironmentVariable("TMP", "D:\Temp", "Machine")
} else {
  Write-Warning "Not running as Administrator. Machine TEMP/TMP was not changed. Re-run elevated to apply machine scope."
}

Write-Step "Setup complete. Reboot recommended for full environment propagation."
