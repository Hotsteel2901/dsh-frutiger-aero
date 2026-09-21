# dsh-frutiger-aero — GitHub installer for Windows.
#
#   irm https://raw.githubusercontent.com/Hotsteel2901/dsh-frutiger-aero/main/install.ps1 | iex
#   $env:DSH_FRUTIGER_PROFILE = 'aero'; irm ... | iex
#   irm ... | iex -Args '-Ref','main'          # pin a specific ref
#
# Needs nothing but Node and PowerShell 5.1+. No package manager, no registry
# account, no git, no build. It downloads a snapshot of this repository and
# hands over to the bundled `install.mjs`, so the install logic lives in exactly
# one place.
#
# It installs the default branch rather than `releases/latest`, for the reason
# spelled out in install.sh: a release tag and the branch it was cut from both
# announce `version: 1.1.0` while holding different code, so a tag-based default
# made "did I get anything new?" unanswerable and made reinstalling a no-op.
# `-Ref` pins a tag or commit when that is what you want.

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

# The major version matters, not just the presence of Node. `dsh` dispatches
# through `if (import.meta.main)`, unimplemented before Node 24; below that the
# check is falsy, so the CLI prints nothing and exits 0. A user on 20 or 22 sees
# a skin that does nothing and concludes the install failed, when nothing about
# the install was ever wrong.
$nodeMajor = 0
try { $nodeMajor = [int](& node -p 'Number(process.versions.node.split(".")[0])') } catch { $nodeMajor = 0 }
if ($nodeMajor -lt 24) {
  Fail "Node 24 or newer is required and this is Node $(& node -v). Below 24 the Harness CLI exits silently, which looks exactly like a broken install. Nothing else needs changing."
}

if (-not $Ref) {
  # Ask the API for the default branch rather than assuming its name, and fall
  # back to `main` when the probe cannot reach GitHub — the download below is
  # the real check either way.
  try {
    $repoInfo = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo" -UseBasicParsing
    $Ref = $repoInfo.default_branch
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
Write-Host 'If the skin ever looks wrong, ask what is installed instead of reinstalling -'
Write-Host 'the answer names the problem, and no step it prints asks you to start over:'
Write-Host "  node install.mjs --profile $Profile --doctor"
Write-Host ''
Write-Host 'Start it with:'
Write-Host "  dsh --profile $Profile --port 3099 --no-open"
Write-Host ''
Write-Host 'then open the URL that command prints (it carries the one-time token).'
