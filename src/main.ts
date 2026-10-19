import { Plugin, WorkspaceLeaf } from 'obsidian';

/**
 * View types registered by the Thino plugin (obsidian-memos) that represent a
 * Thino workspace of their own. The changelog view is deliberately excluded.
 */
const THINO_VIEW_TYPES = ['thino_view', 'thino-super-view'];

/**
 * Window width (px) below which the sidebars are collapsed while a Thino view
 * is active. On wider windows the sidebars stay open so the extra room is not
 * wasted hiding panes the user still wants to see.
 */
const WIDTH_THRESHOLD = 1200;

export default class HideSidebarsInThino extends Plugin {
	onload(): void {
		this.app.workspace.onLayoutReady(() => {
			// `activeLeaf` is deprecated, so the active leaf is taken from
			// `getMostRecentLeaf()` here and from the event payload afterwards.
			this.apply(this.app.workspace.getMostRecentLeaf());
			this.registerEvent(
				this.app.workspace.on('active-leaf-change', (leaf) => this.apply(leaf))
			);
			// Re-evaluate when the window is resized across the threshold. Listen
			// on `window` directly: `workspace.on('resize')` fires on layout
			// changes (split/leaf resize), not on window size changes.
			this.registerDomEvent(window, 'resize', () =>
				this.apply(this.app.workspace.getMostRecentLeaf())
			);
		});
	}

	onunload(): void {
		// Never leave the user with hidden sidebars after the plugin is gone.
		if (this.isThinoActive(this.app.workspace.getMostRecentLeaf())) {
			this.setSidebarsHidden(false);
		}
	}

	private isThinoActive(leaf: WorkspaceLeaf | null): boolean {
		const type = leaf?.view?.getViewType();
		return type !== undefined && THINO_VIEW_TYPES.includes(type);
	}

	/**
	 * Runs whenever the active tab changes or the window is resized. Both
	 * sidebars are collapsed while a Thino view is active on a narrow window,
	 * and expanded again otherwise. Sidebars are only touched on a tab change
	 * or a resize, so opening or closing one by hand stays as you left it until
	 * the next such event.
	 */
	private apply(leaf: WorkspaceLeaf | null): void {
		const shouldHide =
			this.isThinoActive(leaf) && window.innerWidth < WIDTH_THRESHOLD;
		this.setSidebarsHidden(shouldHide);
	}

	private setSidebarsHidden(hidden: boolean): void {
		const { leftSplit, rightSplit } = this.app.workspace;
		for (const split of [leftSplit, rightSplit]) {
			if (!split) continue;
			if (hidden && !split.collapsed) split.collapse();
			if (!hidden && split.collapsed) split.expand();
		}
	}
}
