# Registry submission

`awesome-dsh-plugin.yml` is the entry to open a pull request with against
[dsh-market/dsh-market]'s catalog — [awesome-dsh-plugin/awesome-dsh-plugin].

## How to submit

That list keeps its data in `data/plugins/`, one YAML file per plugin, and its
READMEs are generated from those files. Open **one** PR adding **one** file,
named after the repository:

```
data/plugins/USERNAME__dsh-frutiger-aero.yml
```

Copy `awesome-dsh-plugin.yml` from this directory into it and change nothing
else. Do not edit either README — they are regenerated on `main` after the PR
merges, which is also why entry files never conflict with each other.

Once it is merged, [dsh-market](https://github.com/dsh-market/dsh-market) picks
it up automatically (usually within a day), because the market reads the same
curated registry rather than keeping its own copy.
