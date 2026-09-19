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
- it matches the npm package name exactly (`dsh-frutiger-aero`), which matters because the
  registry maps a listing to its npm package by name.

The npm package name is baked into `packages/frutiger-aero/package.json` and into every install
command in the docs. **If you pick a different repository name, the npm package name can stay
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

## 6 · npm

The one-liner (`dsh plugin --profile web add dsh-frutiger-aero`) is what the ecosystem reaches
for first, and the registry tracks npm downloads as its popularity signal. Publishing also makes
the shields.io badges in the README resolve.

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
- [x] Registry PR opened — [awesome-dsh-plugin#5431](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/5431)
- [ ] **npm published** — needs an npm account; the GitHub token cannot do it (see below)
- [ ] `dsh plugin --profile web add dsh-frutiger-aero` verified on a clean profile (blocked on npm)
- [ ] **Rotate the GitHub token** that was used for the push

### The two that need you

**Social preview.** GitHub has no API for it. Settings → General → Social preview → upload
`docs/assets/og.jpg`. Until then every shared link renders a grey card.

**npm.** The publish workflow is in place and skips itself cleanly while `NPM_TOKEN` is unset, so
the repository never shows a red X for it. To publish:

```sh
cd packages/frutiger-aero
npm login
npm publish --access public
```

…or add an `NPM_TOKEN` repository secret (npm automation token, publish rights) and re-run the
*Publish to npm* workflow. Tags only — it never publishes from a branch push, and it fails the
build if the committed `lib/` does not match `src/`.

Once npm is live, three things resolve at once: the one-liner install works, the two shields.io
badges in the README start rendering, and the registry can map the listing to its download stats.

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
