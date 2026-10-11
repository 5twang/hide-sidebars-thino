import { Plugin, WorkspaceLeaf } from 'obsidian';

/**
 * View types registered by the Thino plugin (obsidian-memos) that represent a
 * Thino workspace of their own. The changelog view is deliberately excluded.
 */
const THINO_VIEW_TYPES = ['thino_view', 'thino-super-view'];

export default class HideSidebarsInThino extends Plugin {
	onload(): void {
		this.app.workspace.onLayoutReady(() => {
			// `activeLeaf` is deprecated, so the active leaf is taken from
			// `getMostRecentLeaf()` here and from the event payload afterwards.
			this.apply(this.app.workspace.getMostRecentLeaf());
			this.registerEvent(
				this.app.workspace.on('active-leaf-change', (leaf) => this.apply(leaf))
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
	 * Runs whenever the active tab changes: both sidebars are collapsed while a
	 * Thino view is active and expanded again on any other tab. Sidebars are only
	 * touched on a tab change, so opening or closing one by hand stays as you left
	 * it until you switch tabs again.
	 */
	private apply(leaf: WorkspaceLeaf | null): void {
		this.setSidebarsHidden(this.isThinoActive(leaf));
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
