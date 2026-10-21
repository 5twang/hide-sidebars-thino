# Hide Sidebars in Thino

Hide both sidebars while a [Thino](https://github.com/Quorafind/Obsidian-Thino) view is active, and show them
again after you switch to another tab.

Thino is a place for quick capture and memos. While you are writing there, the file explorer and the
backlink panes are just taking up room. This plugin collapses both sidebars as soon as a Thino view becomes
the active tab, and restores them when you move on to your notes.

## Behavior

- Both sidebars are collapsed while the active tab is a Thino view.
- Both sidebars are expanded again on any other tab, so leaving Thino always brings your layout back.
- The collapse only happens on windows narrower than a width threshold, so on a big screen the sidebars
  stay open. The threshold is configurable (default 1200 px).
- Sidebars are only touched when the active tab changes: if you open or close one by hand, it stays as you
  left it until the next tab switch.
- The threshold is re-evaluated on window resize, and nothing happens until the workspace is ready.

## Settings

- **Width threshold (px)** — collapse the sidebars while a Thino view is active when the window is narrower
  than this value. Raise it (e.g. to 1500) if you want the sidebars to hide even on a larger window.

## Requirements

- Obsidian 1.2.8 or newer, desktop only.
- The [Thino](https://github.com/Quorafind/Obsidian-Thino) plugin, enabled. Without it there is no Thino view
  to react to and this plugin does nothing.

The plugin matches the view types `thino_view` and `thino-super-view` that Thino registers. If a future Thino
release renames them, the plugin needs an update.

## Installation

- Community plugins: search for "Hide Sidebars in Thino" in **Settings → Community plugins → Browse**.
- Manual: copy `main.js` and `manifest.json` into `<vault>/.obsidian/plugins/hide-sidebars-thino/` and enable
  the plugin in **Settings → Community plugins**.

## Development

```bash
npm install
npm run dev     # watch + rebuild main.js
npm run build   # type-check and build a production main.js
npm run lint    # official Obsidian plugin lint rules
```

## Releasing a new version

`manifest.json` is the source of truth for the version. `main.js` is not committed: the release workflow
builds it, signs its build provenance and attaches it to the GitHub release, which is what Obsidian downloads
(and what the directory checks for attestations).

```bash
./release.sh           # patch bump; ./release.sh minor for a feature release
```

That bumps `package.json`, `manifest.json` and `versions.json`, pushes the commit and the tag, then waits for
the `release` workflow to build, attest and publish the release.

## 中文说明

当 Thino 视图处于激活状态时自动收起左右两侧边栏，切到其他标签页时再展开；只在切换标签页时动作，
你手动开合的侧栏不会被打断。需要已启用 Thino 插件（obsidian-memos），桌面端适用。

## License

MIT — see [LICENSE](LICENSE).
