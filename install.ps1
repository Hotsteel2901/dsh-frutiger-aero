# dsh-frutiger-aero — GitHub installer for Windows.
#
#   irm https://raw.githubusercontent.com/Hotsteel2901/dsh-frutiger-aero/main/install.ps1 | iex
#   $env:DSH_FRUTIGER_PROFILE = 'aero'; irm ... | iex        # pick a profile
#   $env:DSH_FRUTIGER_REF = 'v1.1.0';   irm ... | iex        # pin a tag or commit
#   .\install.ps1 -Ref main -Profile aero                    # when run as a file
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
# `-Ref` pins a tag or commit when that is what you want. The version and build
# fingerprint actually installed are printed at the end, so "am I on the latest"
# has an answer.
#
# ## Why there is no `param()` block, and why that is not a style choice
#
# This script is normally run as `irm ... | iex`, and in that path a `param()`
# block does **not** behave the way it reads:
#
#   1. **`[string]$Home` collides with the read-only automatic `$HOME`.** Which
#      PowerShell variables are case-insensitive means `$Home` and `$HOME` are
#      the same variable, so evaluating the block throws
#      `Cannot overwrite variable HOME because it is read-only or constant` —
#      and the install dies before its first line of real work.
#   2. **Parameter defaults are not applied.** The `$(if ($env:...) ...)`
#      defaults below never took effect under `Invoke-Expression`, so a user who
#      set `DSH_FRUTIGER_PROFILE` got the default profile silently. A wrong
#      answer that looks like a working install is worse than an error.
#
# Both were measured on PowerShell 7.4.6, not assumed: with the environment
# variable set, the `param()` version still reported `profile=frutiger`, and
# removing the block made it report `profile=aero`.
#
# So the parameters are read in the body, with the precedence
# `explicit argument -> environment variable -> default`, and the whole file
# behaves identically whether it is piped into `iex` or run as `.\install.ps1`.
# (`iex -Args` does not exist — `Invoke-Expression` has no `-Args` parameter —
# which is why the environment variable is the documented way to pass values.)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Explicit arguments win, but they are only present when this file is run as a
# script. Under `irm | iex` they are empty and the environment decides.
$argProfile = $null
$argRef = $null
$argHome = $null
$argRepo = $null
for ($i = 0; $i -lt $args.Count; $i++) {
  switch ($args[$i]) {
    '--profile' { $argProfile = $args[$i + 1]; $i++ }
    '-Profile'  { $argProfile = $args[$i + 1]; $i++ }
    '--ref'     { $argRef = $args[$i + 1]; $i++ }
    '-Ref'      { $argRef = $args[$i + 1]; $i++ }
    '--home'    { $argHome = $args[$i + 1]; $i++ }
    '-Home'     { $argHome = $args[$i + 1]; $i++ }
    '--repo'    { $argRepo = $args[$i + 1]; $i++ }
    '-Repo'     { $argRepo = $args[$i + 1]; $i++ }
  }
}

# `$HomeDir`, never `$Home`: see the note above about the read-only `$HOME`.
$Profile = if ($argProfile) { $argProfile } elseif ($env:DSH_FRUTIGER_PROFILE) { $env:DSH_FRUTIGER_PROFILE } else { 'frutiger' }
$Ref = if ($argRef) { $argRef } elseif ($env:DSH_FRUTIGER_REF) { $env:DSH_FRUTIGER_REF } else { $null }
$HomeDir = if ($argHome) { $argHome } elseif ($env:DSH_FRUTIGER_HOME) { $env:DSH_FRUTIGER_HOME } else { $null }
$Repo = if ($argRepo) { $argRepo } elseif ($env:DSH_FRUTIGER_REPO) { $env:DSH_FRUTIGER_REPO } else { 'Hotsteel2901/dsh-frutiger-aero' }

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
  if ($HomeDir) { $arguments += @('--home', $HomeDir) }
  & node @arguments
  if ($LASTEXITCODE -ne 0) { Fail 'the installer reported a failure' }
} finally {
  Remove-Item -Recurse -Force $temp -ErrorAction SilentlyContinue
}

# One line naming the source, then stop. `install.mjs` has already printed the
# version, the build fingerprint, where it landed and how to start it — the
# identity that answers "am I on the latest?" — so repeating any of it here
# would only give the reader two summaries to reconcile. What this script alone
# knows is *which ref it fetched*, and that is the one thing worth adding.
Write-Host ''
Write-Host "dsh-frutiger-aero: installed from $Repo@$Ref"
Write-Host 'the version and build fingerprint above are what is installed now.'
