<#
.SYNOPSIS
  Generates a Windows developer workstation audit report.
.DESCRIPTION
  Collects application, startup, task, service, disk, and environment diagnostics.
  Safe to run repeatedly. Output is written to D:\Tools\AuditReports.
#>

[CmdletBinding()]
param(
  [string]$ReportRoot = "D:\Tools\AuditReports"
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
  Write-Host "[AUDIT] $Message" -ForegroundColor Cyan
}

Write-Step "Ensuring report directory exists: $ReportRoot"
New-Item -ItemType Directory -Path $ReportRoot -Force | Out-Null

Write-Step "Collecting OS and volume information"
Get-ComputerInfo | Out-File (Join-Path $ReportRoot "computerinfo.txt")
Get-Volume | Sort-Object DriveLetter | Format-Table -AutoSize | Out-File (Join-Path $ReportRoot "volumes.txt")
Get-PSDrive -PSProvider FileSystem | Out-File (Join-Path $ReportRoot "filesystem-drives.txt")

Write-Step "Collecting installed applications"
if (Get-Command winget -ErrorAction SilentlyContinue) {
  winget list | Out-File (Join-Path $ReportRoot "winget-list.txt")
} else {
  "winget not available on this host." | Out-File (Join-Path $ReportRoot "winget-list.txt")
}

Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* |
  Select-Object DisplayName, DisplayVersion, Publisher, InstallDate, InstallLocation |
  Sort-Object DisplayName |
  Export-Csv (Join-Path $ReportRoot "installed-apps-machine.csv") -NoTypeInformation

Get-ItemProperty HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* |
  Select-Object DisplayName, DisplayVersion, Publisher, InstallDate, InstallLocation |
  Sort-Object DisplayName |
  Export-Csv (Join-Path $ReportRoot "installed-apps-user.csv") -NoTypeInformation

Write-Step "Collecting startup programs, scheduled tasks, and services"
Get-CimInstance Win32_StartupCommand |
  Select-Object Name, Command, Location, User |
  Export-Csv (Join-Path $ReportRoot "startup-commands.csv") -NoTypeInformation

Get-ScheduledTask |
  Select-Object TaskName, TaskPath, State |
  Export-Csv (Join-Path $ReportRoot "scheduled-tasks.csv") -NoTypeInformation

Get-Service |
  Select-Object Name, DisplayName, Status, StartType |
  Export-Csv (Join-Path $ReportRoot "services.csv") -NoTypeInformation

Write-Step "Calculating top C: directory consumers (depth 1)"
Get-ChildItem C:\ -Directory -Force -ErrorAction SilentlyContinue |
  ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -Force -ErrorAction SilentlyContinue |
      Measure-Object Length -Sum).Sum

    [PSCustomObject]@{
      Path   = $_.FullName
      SizeGB = [math]::Round(($size / 1GB), 2)
    }
  } |
  Sort-Object SizeGB -Descending |
  Export-Csv (Join-Path $ReportRoot "c-drive-top-folders.csv") -NoTypeInformation

Write-Step "Collecting environment and package cache settings"
Get-ChildItem Env: | Sort-Object Name | Out-File (Join-Path $ReportRoot "env-vars.txt")

if (Get-Command npm -ErrorAction SilentlyContinue) {
  npm config get cache | Out-File (Join-Path $ReportRoot "npm-cache-path.txt")
  npm config get prefix | Out-File (Join-Path $ReportRoot "npm-prefix-path.txt")
}

if (Get-Command pip -ErrorAction SilentlyContinue) {
  pip cache dir | Out-File (Join-Path $ReportRoot "pip-cache-path.txt")
}

if (Get-Command python -ErrorAction SilentlyContinue) {
  python -m site | Out-File (Join-Path $ReportRoot "python-site.txt")
}

Write-Step "Audit complete. Reports saved to $ReportRoot"
