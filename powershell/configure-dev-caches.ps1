<#
.SYNOPSIS
  Redirects development package caches and global install locations to D:.
.DESCRIPTION
  Configures npm, pip, gradle, nuget, and yarn cache homes.
  Safe to run repeatedly.
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param()

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
  Write-Host "[CACHE] $Message" -ForegroundColor Yellow
}

$requiredDirs = @(
  "D:\Cache\npm",
  "D:\Cache\pip",
  "D:\Cache\gradle",
  "D:\Cache\nuget",
  "D:\Cache\yarn",
  "D:\Tools\npm-global"
)

Write-Step "Ensuring cache directories exist"
foreach ($dir in $requiredDirs) {
  if ($PSCmdlet.ShouldProcess($dir, "Create directory")) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
}

if (Get-Command npm -ErrorAction SilentlyContinue) {
  Write-Step "Configuring npm cache and global prefix"
  npm config set cache "D:\Cache\npm" --global | Out-Null
  npm config set prefix "D:\Tools\npm-global" --global | Out-Null
} else {
  Write-Warning "npm not found; skipping npm configuration."
}

if (Get-Command pip -ErrorAction SilentlyContinue) {
  Write-Step "Configuring pip cache"
  pip config set global.cache-dir "D:\Cache\pip" | Out-Null
} else {
  Write-Warning "pip not found; skipping pip configuration."
}

Write-Step "Setting Gradle/NuGet/Yarn environment variables"
[Environment]::SetEnvironmentVariable("GRADLE_USER_HOME", "D:\Cache\gradle", "User")
[Environment]::SetEnvironmentVariable("NUGET_PACKAGES", "D:\Cache\nuget", "User")
[Environment]::SetEnvironmentVariable("YARN_CACHE_FOLDER", "D:\Cache\yarn", "User")

Write-Step "Cache redirection complete. Start a new shell session to pick up updated variables."
