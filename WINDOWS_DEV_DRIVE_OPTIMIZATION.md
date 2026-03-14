# Windows Developer Workstation Optimization Plan (C: Minimized, D: Primary)

> **Goal:** Keep `C:` limited to Windows + core system components (and Git), while moving developer workloads, caches, temp files, and user data to `D:` for performance and space stability.

## 1) System audit summary

Run the following **read-only** audit commands first from an elevated PowerShell session.

```powershell
# Create folders for reports
New-Item -ItemType Directory -Force -Path "D:\Tools\AuditReports" | Out-Null

# OS / hardware / disk overview
Get-ComputerInfo | Out-File "D:\Tools\AuditReports\computerinfo.txt"
Get-Volume | Sort-Object DriveLetter | Format-Table -AutoSize | Out-File "D:\Tools\AuditReports\volumes.txt"
Get-PSDrive -PSProvider FileSystem | Out-File "D:\Tools\AuditReports\psdrives.txt"

# Installed applications (winget + registry)
winget list | Out-File "D:\Tools\AuditReports\winget-list.txt"
Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* |
  Select-Object DisplayName, DisplayVersion, Publisher, InstallDate, InstallLocation |
  Sort-Object DisplayName |
  Export-Csv "D:\Tools\AuditReports\installed-apps-machine.csv" -NoTypeInformation
Get-ItemProperty HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* |
  Select-Object DisplayName, DisplayVersion, Publisher, InstallDate, InstallLocation |
  Sort-Object DisplayName |
  Export-Csv "D:\Tools\AuditReports\installed-apps-user.csv" -NoTypeInformation

# Startup entries / scheduled tasks / services
Get-CimInstance Win32_StartupCommand |
  Select-Object Name, Command, Location, User |
  Export-Csv "D:\Tools\AuditReports\startup-commands.csv" -NoTypeInformation
Get-ScheduledTask |
  Select-Object TaskName, TaskPath, State |
  Export-Csv "D:\Tools\AuditReports\scheduled-tasks.csv" -NoTypeInformation
Get-Service |
  Select-Object Name, DisplayName, Status, StartType |
  Export-Csv "D:\Tools\AuditReports\services.csv" -NoTypeInformation

# Top C: consumers
Get-ChildItem C:\ -Directory -Force -ErrorAction SilentlyContinue |
  ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
    [PSCustomObject]@{ Path = $_.FullName; SizeGB = [math]::Round(($size/1GB),2) }
  } |
  Sort-Object SizeGB -Descending |
  Export-Csv "D:\Tools\AuditReports\c-drive-top-folders.csv" -NoTypeInformation

# Environment and package/cache paths
Get-ChildItem Env: | Sort-Object Name | Out-File "D:\Tools\AuditReports\env-vars.txt"
npm config list -l | Out-File "D:\Tools\AuditReports\npm-config.txt"
pip cache dir | Out-File "D:\Tools\AuditReports\pip-cache-dir.txt"
python -m site | Out-File "D:\Tools\AuditReports\python-site.txt"
```

**What to review in report:**
- Any non-system heavy folders on `C:` (especially `Users`, `ProgramData`, `%LOCALAPPDATA%`, package caches).
- Startup/scheduled tasks tied to non-essential vendor utilities.
- Developer tools installed under `C:\Users\...` instead of `D:`.

---

## 2) Applications to uninstall (safe recommendations)

Keep:
- Windows components and drivers.
- Git.
- Security tools you actively use.

Common removable candidates (validate before removal):
- OEM utilities: trial AV suites, updater hubs, telemetry dashboards, support assistants.
- Consumer bloat: game launchers, preinstalled media apps, “helper” apps not needed for development.
- Duplicate runtimes/SDKs you no longer use.
- Cloud sync clients not in active use.

PowerShell/winget uninstall workflow:

```powershell
# Review first
winget list

# Example removals (replace with exact IDs from `winget list`)
# winget uninstall --id <Vendor.AppId> --silent

# Optional cleanup of provisioned Appx packages (advanced; review each first)
Get-AppxPackage | Select-Object Name, PackageFullName | Sort-Object Name
```

> **Safety warning:** Do not remove graphics/audio/chipset/network drivers, .NET runtimes required by active tooling, or Microsoft Visual C++ Redistributables unless confirmed unused.

---

## 3) Disk cleanup actions

1. Run Storage Sense + cleanmgr for system-safe cleanup.
2. Purge temp/cache folders after moving temp paths.
3. Remove stale installer/update leftovers.

```powershell
# Ensure destination folders exist
New-Item -ItemType Directory -Force -Path "D:\Temp","D:\Cache" | Out-Null

# Built-in cleanup tools
cleanmgr /sageset:1
cleanmgr /sagerun:1

# Windows Update component cleanup (safe)
DISM /Online /Cleanup-Image /StartComponentCleanup

# Temp cleanup (user + machine temp)
Get-ChildItem "$env:TEMP" -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem "C:\Windows\Temp" -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
```

Edge cache cleanup:

```powershell
$edgeCache = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache"
if (Test-Path $edgeCache) {
  Get-ChildItem $edgeCache -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}
```

---

## 4) Folder relocation plan

Create target structure:

```powershell
New-Item -ItemType Directory -Force -Path `
"D:\Dev", "D:\Tools", "D:\Projects", "D:\Workspace", "D:\Temp", "D:\Cache", "D:\Downloads" | Out-Null
```

Relocate user folders (GUI method preferred):
- `Downloads`, `Documents`, `Desktop`: Right click folder → **Properties** → **Location** → Move to corresponding `D:` path.

Recommended mapping:
- `%USERPROFILE%\Downloads` → `D:\Downloads`
- `%USERPROFILE%\Documents` → `D:\Workspace\Documents`
- `%USERPROFILE%\Desktop` → `D:\Workspace\Desktop`
- Repositories → `D:\Projects`
- Active dev workspaces → `D:\Workspace`

Optional junctions (only when an app cannot change path):

```powershell
# Example: move heavy fixed cache folder then create junction
# robocopy "C:\Path\HeavyFolder" "D:\Cache\HeavyFolder" /MIR /COPYALL /XJ
# rmdir "C:\Path\HeavyFolder"
# cmd /c mklink /J "C:\Path\HeavyFolder" "D:\Cache\HeavyFolder"
```

---

## 5) Environment variable changes

Set system/user temp to `D:\Temp`.

```powershell
# System-wide (admin)
[Environment]::SetEnvironmentVariable("TEMP", "D:\Temp", "Machine")
[Environment]::SetEnvironmentVariable("TMP",  "D:\Temp", "Machine")

# User-level
[Environment]::SetEnvironmentVariable("TEMP", "D:\Temp", "User")
[Environment]::SetEnvironmentVariable("TMP",  "D:\Temp", "User")
```

Restart required for full propagation.

---

## 6) Developer environment configuration

### Node.js / npm

```powershell
npm config set cache "D:\Cache\npm" --global
npm config set prefix "D:\Tools\npm-global" --global
```

Add to PATH:
- `D:\Tools\npm-global`

### Python / pip

```powershell
# Persistent pip cache and venv defaults
pip config set global.cache-dir "D:\Cache\pip"

# Create project venvs on D: (per project)
# python -m venv D:\Projects\<repo>\.venv
```

### Git

```powershell
git config --global core.autocrlf true
git config --global gc.auto 256
# Store repos under D:\Projects
```

### Build/temp folders

Set build tools to `D:` where supported:
- Maven: `D:\Cache\m2`
- Gradle: `D:\Cache\gradle`
- NuGet: `D:\Cache\nuget`
- pnpm: `D:\Cache\pnpm`
- Yarn: `D:\Cache\yarn`

Example env vars:

```powershell
[Environment]::SetEnvironmentVariable("MAVEN_OPTS", "-Dmaven.repo.local=D:\Cache\m2", "User")
[Environment]::SetEnvironmentVariable("GRADLE_USER_HOME", "D:\Cache\gradle", "User")
[Environment]::SetEnvironmentVariable("NUGET_PACKAGES", "D:\Cache\nuget", "User")
```

### Containers/WSL (if used)

- Docker Desktop disk image: move to `D:\Tools\DockerData` in Docker settings.
- WSL distributions: export/import to `D:`.

```powershell
# Example WSL move
wsl --shutdown
wsl --export <DistroName> D:\Tools\<DistroName>.tar
wsl --unregister <DistroName>
wsl --import <DistroName> D:\Tools\WSL\<DistroName> D:\Tools\<DistroName>.tar --version 2
```

---

## 7) Automation scripts

### Script A: baseline setup (`setup-dev-drive.ps1`)

```powershell
#requires -RunAsAdministrator
$paths = @("D:\Dev","D:\Tools","D:\Projects","D:\Workspace","D:\Temp","D:\Cache","D:\Downloads","D:\Tools\AuditReports")
$paths | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ | Out-Null }

[Environment]::SetEnvironmentVariable("TEMP", "D:\Temp", "Machine")
[Environment]::SetEnvironmentVariable("TMP",  "D:\Temp", "Machine")
[Environment]::SetEnvironmentVariable("TEMP", "D:\Temp", "User")
[Environment]::SetEnvironmentVariable("TMP",  "D:\Temp", "User")

Write-Host "Base folders + TEMP/TMP configured. Reboot recommended." -ForegroundColor Green
```

### Script B: developer cache redirection (`configure-dev-caches.ps1`)

```powershell
New-Item -ItemType Directory -Force -Path "D:\Cache\npm","D:\Tools\npm-global","D:\Cache\pip","D:\Cache\gradle","D:\Cache\nuget" | Out-Null

npm config set cache "D:\Cache\npm" --global
npm config set prefix "D:\Tools\npm-global" --global
pip config set global.cache-dir "D:\Cache\pip"

[Environment]::SetEnvironmentVariable("GRADLE_USER_HOME", "D:\Cache\gradle", "User")
[Environment]::SetEnvironmentVariable("NUGET_PACKAGES", "D:\Cache\nuget", "User")

Write-Host "Developer cache paths redirected to D:." -ForegroundColor Green
```

### Script C: safe cleanup (`safe-clean.ps1`)

```powershell
#requires -RunAsAdministrator
Write-Host "This removes temporary files only. Review before continuing." -ForegroundColor Yellow
Start-Sleep -Seconds 3

$targets = @(
  "$env:TEMP\*",
  "C:\Windows\Temp\*",
  "$env:LOCALAPPDATA\Temp\*"
)

foreach ($t in $targets) {
  Remove-Item $t -Recurse -Force -ErrorAction SilentlyContinue
}

DISM /Online /Cleanup-Image /StartComponentCleanup | Out-Null
Write-Host "Safe cleanup complete." -ForegroundColor Green
```

---

## 8) Final optimized structure

Target end-state:

```text
C:\
  Windows\
  Program Files\ (minimal, core tools only)
  Program Files (x86)\ (minimal)
  Git\ (or Program Files\Git)
  Essential drivers and system files

D:\
  Dev\
  Tools\
  Projects\
  Workspace\
  Temp\
  Cache\
  Downloads\
```

Performance notes:
- Keep free space on `C:` above 20% to avoid update/performance issues.
- Exclude `D:\Cache` and dependency folders from real-time indexing/AV scanning when acceptable in your security policy.
- Prefer per-project virtual environments and local caches on `D:`.

---

## Execution order (recommended)

1. Run audits and collect reports.
2. Remove unused/bloat apps.
3. Create `D:` folder structure.
4. Relocate user folders.
5. Set `TEMP/TMP` to `D:\Temp` and reboot.
6. Redirect developer caches/toolchains to `D:`.
7. Run cleanup scripts.
8. Re-run audit and compare C: usage before/after.

