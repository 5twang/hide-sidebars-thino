# Hide Sidebars in Thino

Hide both sidebars while a [Thino](https://github.com/Quorafind/Obsidian-Thino) view is active, and show them
again after you switch to another tab.

Thino is a place for quick capture and memos. While you are writing there, the file explorer and the
backlink panes are just taking up room. This plugin collapses both sidebars as soon as a Thino view becomes
the active tab, and restores them when you move on to your notes.

## Behavior

- Sidebars are collapsed when the active tab is a Thino view, and restored when the active tab changes to
  anything else.
- Only sidebars that this plugin collapsed are restored. A sidebar you collapsed yourself stays collapsed.
- The plugin never fights you: if you manually open a sidebar while Thino is active, it stays open until the
  next tab switch.
- Nothing happens on window resize, and nothing happens on startup until the active tab is known.

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

## 中文说明

当 Thino 视图处于激活状态时自动收起左右两侧边栏，切换到其他标签页后恢复；只恢复本插件自己收起的
那侧，不影响你手动折叠的状态。需要已启用 Thino 插件（obsidian-memos），桌面端适用。

## License

MIT — see [LICENSE](LICENSE).
