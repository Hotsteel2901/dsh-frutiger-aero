# Contributing

Thanks for wanting to help. This plugin touches a UI it does not own, so the bar is less about
style and more about not surprising the person running it.

English below · [中文摘要](#中文摘要)

---

## The two rules

Everything in the browser half obeys both. A pull request that breaks either will be asked to
change, no matter how good it looks.

### 1. It may only paint

No state management, no component wrapping, no handler replacement, no `require` of another
client package. The plugin's hooks are stylesheets, nodes it owns, passive listeners, and
attributes on nodes the product owns — that is the whole list.

The reason is not purity. It is that the host half is an empty `apply()`, which means the blast
radius of the entire feature is "the page looks different", and that is why it is safe to install
into an agent that holds your credentials.

### 2. Every side effect is released through `ctx.effect`

Setting `disabled: true` on the row in `cordis.patch.yml` must return the page to stock. If a
stylesheet, listener, timer, node or attribute survives that, it is a bug.

```js
ctx.effect(() => {
  const node = document.createElement('div')
  document.body.append(node)
  return () => node.remove()
}, 'frutiger-aero: what this is')
```

## Before you open a pull request

```sh
node packages/frutiger-aero/build.mjs      # src/ → lib/, and commit the result
```

`lib/` is committed on purpose: installing the plugin must work with nothing but a file copy, so
a build step is a development convenience, never a requirement. A PR whose `lib/` does not match
its `src/` will fail CI.

Then:

| change | what to run |
| --- | --- |
| anything in `src/client/**` or `src/css/**` | `.devtools/interact.mjs` — required |
| layout, mobile layer, touch | `interact.mjs` **and** `final.mjs` |
| performance tiering | `tiers.mjs` |
| the landing page | `landing.mjs` |
| documentation only | nothing |

See [.devtools/README.md](.devtools/README.md) for how to point them at a running profile.

## What makes a good change here

- **Measured, not asserted.** The three worst bugs this plugin has had were all invisible to the
  DOM and visible only in pixels. If you claim something is faster, smaller or more legible, put
  the number in the PR.
- **Explained where it lives.** The CSS and JS are commented at the level of *why*, because the
  rules look arbitrary until you know what broke without them. Keep that up.
- **Cheap by default.** Any new animation is `transform`/`opacity` only, is gated on the tier, and
  stops when it cannot be seen. A new filter needs a very good reason — `backdrop-filter` is the
  single most expensive thing in the design and it already has two gates.
- **Bilingual.** User-facing documentation exists as `README.md` and `README.zh.md`. Both carry
  equal authority; if you edit one, edit the other, then record the pair (see below).

## Documentation pairing

`README.i18n.yaml` stores the git blob hash of each language file as of the last confirmed
consistent state. After editing either side:

```sh
git hash-object README.md README.zh.md
```

…and update the two lines in `README.i18n.yaml` in the same commit.

## Reporting bugs

Use the issue template — the tier, the viewport and whether `?frutiger=off` makes it go away are
the three fields that turn a report into a fix. If it only happens on hardware you have, say so;
a screenshot of the console is worth more than a description of it.

## 中文摘要

两条规则，必须同时满足：

1. **只允许绘制。** 不管理状态、不包裹组件、不替换事件处理器、不 `require` 其他客户端包。
   宿主端是一个空的 `apply()`，所以整个功能的影响范围就是「页面看起来不一样了」——
   这正是它可以被安全装进一个持有你凭据的 agent 里的原因。
2. **每个副作用都通过 `ctx.effect` 释放。** 在 `cordis.patch.yml` 里设 `disabled: true`
   之后必须完全恢复原样；残留的样式表、监听器、定时器、节点或属性都算 bug。

提交前：

```sh
node packages/frutiger-aero/build.mjs      # src/ → lib/，并提交产物
```

`lib/` 是故意提交的 —— 安装必须只靠复制文件就能完成，构建只是开发期的便利。
改了移动端或布局请跑一遍 `.devtools/interact.mjs`（真实触摸输入，29 条断言）。

文档是中英双份（`README.md` / `README.zh.md`），两边权威对等：
改了一边就改另一边，并在同一次提交里更新 `README.i18n.yaml` 里的 blob 哈希。

如果你声称某个改动更快、更小或更清晰，请把数字放进 PR —— 这个插件历史上最严重的三个
bug 全都是 DOM 断言看不见、只有像素能看出来的。
