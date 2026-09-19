# Registry submission

**Status: submitted.** Pull request
[awesome-dsh-plugin#5431](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/5431)
adds the single entry file the list asks for. Once it merges,
[dsh-market](https://github.com/dsh-market/dsh-market) picks the plugin up
automatically, because the market reads that curated registry rather than
keeping its own catalog.

The file here is the template it was generated from, kept so a future rename or
description change has one place to start.

## If it needs to be resubmitted

That list keeps its data in `data/plugins/`, one YAML file per plugin, and its
READMEs are generated from those files — so a submission is **one PR adding one
file**, named after the repository:

```
data/plugins/<owner>__<repo>.yml
```

Do not edit either README. They are regenerated on `main` after the merge, which
is also why entry files never conflict with each other.

```sh
git clone https://github.com/<owner>/awesome-dsh-plugin
cd awesome-dsh-plugin
git checkout -b add-dsh-frutiger-aero
cp ../dsh-frutiger-aero/submission/awesome-dsh-plugin.yml \
   data/plugins/<owner>__dsh-frutiger-aero.yml
```

…then open a pull request. Only `description.en` is required — a missing Chinese
translation is the maintainers' work, not a reason to bounce a plugin — but both
are supplied here.
