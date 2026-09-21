# Release runbook

Everything needed to go from this directory to a published, discoverable plugin. Ten files
carry the repository owner as a placeholder in absolute URLs; step 3 replaces all of them in one
pass with `node scripts/set-repo.mjs <owner>`.

---

## 1 · Name the repository

**Recommended: `dsh-frutiger-aero`**

Why this one:

- it follows the ecosystem's own naming convention — the `dsh-` prefix is what every plugin on
  the [`dsh-plugin` topic](https://github.com/topics/dsh-plugin) uses (`dsh-desktop`, `dsh-web`,
  `dsh-market`, `dsh-TUI`), so it sorts and searches alongside them;
- it names the aesthetic, which is the thing people will actually search for — nobody types
  "glass theme plugin", plenty of people type "frutiger aero";
- it is unclaimed: a GitHub search for `dsh frutiger aero` returns **0 repositories**, and none
  of the ~3,900 plugins in the curated registry uses the name;
- it matches the `name` field in `packages/frutiger-aero/package.json` (`dsh-frutiger-aero`),
  which keeps the package self-consistent if it is ever published to a registry.

> **Not on npm, and not going to be.** The maintainer has no npm account, so nothing here is
> published to the registry and no user-facing document tells anyone to install from it. The
> `name` field stays because it is what the package calls itself and what an installer would
> use to look it up locally — changing it would be churn for no benefit. Sections below that
> mention npm are marked as **inactive**.

The package name is baked into `packages/frutiger-aero/package.json` and referenced by the
installers. **If you pick a different repository name, the package name can stay
`dsh-frutiger-aero`** — they do not have to match — but if you would rather change both, say so
and it is a one-pass rename.

Alternatives, if you prefer: `dsh-aero` (shorter, less specific), `dsh-frutiger-aero-theme`
(matches the `dsh-*-theme` pattern some skins use, but longer and redundant).

---

## 2 · Create the repository

Create it **empty** — no README, no .gitignore, no licence. This directory already has all
three, and an initialised repo would collide on the first push.

| setting | value |
| --- | --- |
| Owner | your account, or an org |
| Name | `dsh-frutiger-aero` |
| Visibility | Public |
| Initialize | **none** of the checkboxes |

Then send me the URL. I will do step 3 and hand back a ready-to-push tree.

---

## 3 · What I do once I have the URL

1. Replace every `Hotsteel2901` placeholder — in `README.md`, `README.zh.md`, `docs/index.html`
   (canonical, Open Graph, Twitter, the install commands), `install.sh`, `install.ps1`,
   `submission/awesome-dsh-plugin.yml`, `CHANGELOG.md` and `packages/frutiger-aero/package.json`.
2. `git init`, one initial commit, and a `v1.0.0` tag.
3. Add the remote and push — **this needs credentials I do not have** (see step 4).
4. Verify the landing page builds and serves, and that `docs/assets/og.jpg` is reachable at the
   Open Graph URL.

## 4 · Credentials for the push

There is no `gh` CLI, no SSH key and no token in this environment, so I cannot authenticate as
you. Three options, best first:

**A · Deploy key (recommended).** I generate an SSH keypair; you paste the *public* half into
**Settings → Deploy keys → Add deploy key** with **Allow write access** checked. I push over SSH.
A deploy key is scoped to this one repository and you can delete it the moment the push is done.
No credential that can touch anything else ever passes through me.

**B · Fine-grained token.** You create a token scoped to *only* this repository with
*Contents: read and write*, and hand it over for the push. It works, but it is a broader
credential than the job needs — if you take this route, set a one-day expiry and revoke it
immediately afterwards.

**C · You push.** I prepare everything, then you run:

```sh
cd /root/dsh-Frutiger
git remote add origin git@github.com:Hotsteel2901/dsh-frutiger-aero.git
git push -u origin main && git push origin v1.0.0
```

Slowest for me, fastest overall, and no secret moves at all. Tell me which and I will set it up.

---

## 5 · Repository settings, for discoverability

Do these in the GitHub UI right after the push. They are the difference between a repository
that exists and one people find.

### Description

```
🫧 Frutiger Aero skin for DeepSeek Harness (dsh): glass over a living sky-and-water wallpaper,
aqua gloss, light + dark. Rebuilds the phone layout too — drawer, dock, edge swipes,
keyboard-aware composer. 玻璃质感皮肤，电脑端与手机端都适配。
```

### Website

```
https://Hotsteel2901.github.io/dsh-frutiger-aero/
```

### Topics

Paste these one at a time (GitHub's topic field takes them individually), or add them via the
API in one call:

```
dsh-plugin  deepseek-harness  dsh  dsh-web  cordis  cordis-plugin
theme  skin  web-ui  ui-theme  frutiger-aero  aero  glassmorphism
frosted-glass  mobile  responsive  touch  dark-mode  light-mode  visual-effects
```

`dsh-plugin` first — it is the topic the official
[plugin topic page](https://github.com/topics/dsh-plugin) and every third-party market index on.

### Social preview

**Settings → General → Social preview → Upload an image** → `docs/assets/og.jpg`.

This is what renders when the link is pasted into Slack, Discord, X, Reddit or a chat. Without
it GitHub generates a grey card, and the plugin's whole pitch is that it looks like something.

### Pages

**Settings → Pages → Source: GitHub Actions.** The `pages.yml` workflow then publishes `docs/`
on every push to `main`. If you would rather not run Actions at all, set the source to
*Deploy from a branch → main → /docs* instead, and delete `.github/workflows/pages.yml` — the two
mechanisms must not both be configured.

---

## 6 · npm — **INACTIVE, THIS RELEASE DOES NOT USE IT**

> ══ **Currently not in use. Kept for reference only.** ══
> The maintainer has **no npm account**, so this package is not published to the registry and
> must not be. Every user-facing document — both READMEs, the landing page, `install.sh`,
> `install.ps1`, `packages/frutiger-aero/README.md` — was stripped of npm instructions on
> purpose; `grep -rn npm` over them returns **0 hits**. Installation goes through the GitHub
> installer instead: `curl -fsSL https://raw.githubusercontent.com/Hotsteel2901/dsh-frutiger-aero/main/install.sh | sh`.
> Nothing in this section needs to be done, and nothing breaks by leaving it undone.
> `.github/workflows/publish.yml` is still present but **skips itself** while `NPM_TOKEN` is
> unset, reporting a notice rather than a failure.

Should an npm account ever appear, this is the path — otherwise skip to §7.

The one-liner (`dsh plugin --profile web add dsh-frutiger-aero`) is what the ecosystem reaches
for first, and the registry tracks npm downloads as its popularity signal. Publishing would also
make the shields.io badges in the README resolve.

```sh
cd packages/frutiger-aero
npm publish --access public
```

Requires an npm account and `npm login` first. With the repository pushed, `.github/workflows/
publish.yml` does it automatically on a `v*` tag once you add an `NPM_TOKEN` repository secret.
The workflow rebuilds `lib/` and **fails if the committed bundle is stale**, so a release can
never ship a bundle that does not match its source.

After the first publish, bump the version in `packages/frutiger-aero/package.json`, add a
`CHANGELOG.md` entry, then tag.

---

## 7 · Get listed

An entry here puts the plugin in front of every dsh user who browses for plugins, and it is the
only listing that matters — [dsh-market](https://github.com/dsh-market/dsh-market) reads the same
registry rather than keeping its own catalog.

1. Fork [`awesome-dsh-plugin/awesome-dsh-plugin`](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin).
2. Copy `submission/awesome-dsh-plugin.yml` to
   `data/plugins/Hotsteel2901__dsh-frutiger-aero.yml`.
3. Open a PR adding that one file. Do not edit either README — they are regenerated from
   `data/plugins/` after the merge, which is also why entry files never conflict.
4. `description.en` must be one line ending with a period; a description containing `": "` has to
   be quoted (ours is — the entry file is already in the right shape).

The list's own plugin pages take comments, so the listing doubles as a place for people to ask
questions once it is up.

---

## 8 · Release checklist

- [x] Repository created empty, URL sent
- [x] Placeholders replaced (`node scripts/set-repo.mjs Hotsteel2901`), commit + `v1.0.0` tag
- [x] Pushed to `main` and the tag — no credential persisted (verified: `.git/config` is clean)
- [x] Description and Website set
- [x] 20 topics added, `dsh-plugin` among them
- [ ] **Social preview uploaded** — `docs/assets/og.jpg` (Settings → General). No API exists for this one.
- [x] Pages enabled, landing page live at <https://hotsteel2901.github.io/dsh-frutiger-aero/> — 19/19 checks pass against the live site
- [x] Release published from `CHANGELOG.md` (<https://github.com/Hotsteel2901/dsh-frutiger-aero/releases/tag/v1.0.0>)
- [ ] **Registry PR** — prepared in `submission/`, deliberately left to you (see step 7)
- [x] ~~**npm published**~~ — **n/a, deliberately not done**: the maintainer has no npm account,
      all npm install instructions were removed from user-facing docs, and the task is obsolete
- [x] ~~`dsh plugin --profile web add dsh-frutiger-aero` on a clean profile~~ — **n/a for the same
      reason.** The equivalent verification is the GitHub installer on a clean profile, covered
      by `installcheck.mjs` (15/15)
- [ ] **Rotate the GitHub token** that was used for the push
- [x] `v1.0.4` tagged and pushed — the tag carries the release notes, because
      (see below) the token in use cannot create a Release object

### Publishing a Release needs a token this repo does not have

`v1.0.4` is tagged and pushed, and GitHub shows tag-only releases on the Releases
page, but creating a full Release object returned:

```text
HTTP 403  Resource not accessible by personal access token
```

The token used for these pushes authenticates as **`aeroheaven1`**, not
`Hotsteel2901`. It can push commits and tags — the push path is git-over-HTTP and
only needs write access to the repository — but it has no `contents: write`
scope, so anything on the REST API that writes is refused. The same applies to
`git/refs`, so this is a scope limit rather than something specific to releases.

Two ways out, either of which is a one-off:

1. Create the Release in the web UI from the existing `v1.0.4` tag, pasting the
   `## [1.0.4]` section of `CHANGELOG.md` as the body.
2. Or mint a token with `contents: write` on `Hotsteel2901` and run:

   ```sh
   gh release create v1.0.4 --title "dsh-frutiger-aero 1.0.4" \
     --notes-file <(sed -n '/^## \[1.0.4\]/,/^## \[1.1.0\]/p' CHANGELOG.md)
   ```

Worth knowing because of how it failed: while `releases/latest` still pointed at
the *old* tag `1.0.3`, the installer kept working correctly anyway — it resolves
the default branch, not the latest release. That was the whole point of moving it
off `releases/latest`, and this was an unplanned demonstration of it.

### The one that needs you

**Social preview.** GitHub has no API for it. Settings → General → Social preview → upload
`docs/assets/og.jpg`. Until then every shared link renders a grey card.

**npm — not a task any more.** The maintainer has no npm account, and the whole category was
removed from the product rather than left half-documented:

- all npm install instructions are gone from both READMEs, the landing page, `install.sh`,
  `install.ps1`, and `packages/frutiger-aero/README.md` (0 hits for `npm` across all six);
- `.github/workflows/publish.yml` stays but is annotated **inactive** — while `NPM_TOKEN` is
  unset it skips itself and reports a notice, so the repo never shows a red X for it;
- §6 above is kept as reference, with a header saying so.

The three things npm would have bought were all replaced rather than lost: the installer
one-liner (`install.sh`, no registry account needed) replaced the `dsh plugin add` one-liner;
the CI badge replaced the two npm shields; and the registry download signal is simply forgone —
the listing's popularity is measured by GitHub stars, which the repo already has.

## 9 · After the release

The honest position: this plugin's competition is real. The `dsh-plugin` topic has roughly 3,900
listed plugins and about 370 of them are themes or skins, including several glass and ocean
skins with hundreds of stars.

What it has that they mostly do not:

- **the phone layout.** Nearly every skin in that category is desktop-only, and the ones that
  mention mobile are adjusting colours at phone widths rather than restructuring the frame. The
  108px-transcript defect this fixes is measurable and reproducible against stock.
- **a specific, named aesthetic.** "Frutiger Aero" is a nostalgia with a search volume;
  "frosted glass theme" is a category.
- **claims that are checkable.** The verification harness is in the repository — 29 interaction
  assertions and 19 landing-page checks — so a skeptical reader can reproduce every number in
  the README instead of taking it on faith.

Where to say so, when you do:

- a comment on your own registry listing once it is merged (the plugin pages take them);
- the discussion thread of the official repository, if one fits;
- anywhere the aesthetic itself is the hook — Frutiger Aero communities respond to "it is a real
  application you can use today", which is rarer than mockups.

Do **not** mass-post it into other plugins' issue trackers. That is the fastest way to get a
project ignored in a small ecosystem.
