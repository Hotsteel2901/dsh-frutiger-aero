# Registry submission

**Not submitted.** These are the prepared materials for
[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin),
which is the curated list that [dsh-market](https://github.com/dsh-market/dsh-market)
reads — so a single entry there covers both.

Opening that pull request is a **public action under your own name against a
third-party repository**, so it is left to you to decide whether and when to do
it. Nothing in this directory is required for the plugin to work.

## If you decide to submit

That list keeps its data in `data/plugins/`, one YAML file per plugin, and its
READMEs are generated from those files — a submission is **one PR adding one
file**, named after the repository:

```
data/plugins/Hotsteel2901__dsh-frutiger-aero.yml
```

Do not edit either README. They are regenerated on `main` after the merge, which
is also why entry files never conflict with each other.

```sh
# 1. Fork awesome-dsh-plugin/awesome-dsh-plugin in the GitHub UI, then:
git clone https://github.com/Hotsteel2901/awesome-dsh-plugin
cd awesome-dsh-plugin
git checkout -b add-dsh-frutiger-aero

# 2. One file, named <owner>__<repo>.yml
cp /root/dsh-Frutiger/submission/awesome-dsh-plugin.yml \
   data/plugins/Hotsteel2901__dsh-frutiger-aero.yml

git add data/plugins/Hotsteel2901__dsh-frutiger-aero.yml
git commit -m "Add Hotsteel2901/dsh-frutiger-aero (Frutiger Aero skin, desktop + mobile)"
git push -u origin add-dsh-frutiger-aero
```

…then open the pull request from the fork.

Only `description.en` is required — the guide is explicit that a missing Chinese
translation is the maintainers' work, not a reason to bounce a plugin — but both
are supplied here. A description containing `": "` must be quoted; this one is.
