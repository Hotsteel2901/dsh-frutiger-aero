# dsh-frutiger-aero — GitHub installer for Windows.
#
#   irm https://raw.githubusercontent.com/Hotsteel2901/dsh-frutiger-aero/main/install.ps1 | iex
#   $env:DSH_FRUTIGER_PROFILE = 'aero'; irm ... | iex
#
# Needs nothing but Node and PowerShell 5.1+. No npm account, no git, no build.
# It downloads the latest release, then hands over to the bundled `install.mjs`
# so the install logic lives in exactly one place.

[CmdletBinding()]
param(
  [string]$Profile = $(if ($env:DSH_FRUTIGER_PROFILE) { $env:DSH_FRUTIGER_PROFILE } else { 'frutiger' }),
  [string]$Home,
  [string]$Ref,
  [string]$Repo = $(if ($env:DSH_FRUTIGER_REPO) { $env:DSH_FRUTIGER_REPO } else { 'Hotsteel2901/dsh-frutiger-aero' })
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

function Fail($message) { Write-Error "dsh-frutiger-aero: $message"; exit 1 }

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Fail 'Node is required but was not found on PATH' }

if (-not $Ref) {
  try {
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest" -UseBasicParsing
    $Ref = $release.tag_name
  } catch {
    $Ref = $null
  }
  if (-not $Ref) { $Ref = 'main' }
}

$temp = Join-Path ([System.IO.Path]::GetTempPath()) ("dsh-frutiger-" + [System.Guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Path $temp | Out-Null

try {
  Write-Host "dsh-frutiger-aero: fetching $Repo@$Ref"
  $archive = Join-Path $temp 'src.tar.gz'
  $url = "https://codeload.github.com/$Repo/tar.gz/$Ref"
  try {
    Invoke-WebRequest -Uri $url -OutFile $archive -UseBasicParsing
  } catch {
    Fail "could not download $Repo@$Ref - check the repository name and your network"
  }

  # tar is present on Windows 10 1803+ and on every supported PowerShell host.
  $source = Join-Path $temp 'src'
  New-Item -ItemType Directory -Path $source | Out-Null
  tar -xzf $archive -C $source --strip-components=1
  if ($LASTEXITCODE -ne 0) { Fail 'could not extract the downloaded archive' }

  $installer = Join-Path $source 'install.mjs'
  if (-not (Test-Path $installer)) { Fail 'the archive does not look like dsh-frutiger-aero' }

  $arguments = @($installer, '--profile', $Profile)
  if ($Home) { $arguments += @('--home', $Home) }
  & node @arguments
  if ($LASTEXITCODE -ne 0) { Fail 'the installer reported a failure' }
} finally {
  Remove-Item -Recurse -Force $temp -ErrorAction SilentlyContinue
}

Write-Host ''
Write-Host 'Start it with:'
Write-Host "  dsh --profile $Profile --port 3099 --no-open"
Write-Host ''
Write-Host 'then open the URL that command prints (it carries the one-time token).'
