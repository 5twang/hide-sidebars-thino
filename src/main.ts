import { Plugin, WorkspaceLeaf } from 'obsidian';

/**
 * View types registered by the Thino plugin (obsidian-memos) that represent a
 * Thino workspace of their own. The changelog view is deliberately excluded.
 */
const THINO_VIEW_TYPES = ['thino_view', 'thino-super-view'];

export default class HideSidebarsInThino extends Plugin {
	private hidLeft = false;
	private hidRight = false;

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
		this.restore();
	}

	private isThinoActive(leaf: WorkspaceLeaf | null): boolean {
		const type = leaf?.view?.getViewType();
		return type !== undefined && THINO_VIEW_TYPES.includes(type);
	}

	/**
	 * Runs whenever the active tab changes. Sidebars are only collapsed while a
	 * Thino view is active, and only the ones this plugin collapsed are restored
	 * afterwards, so a sidebar the user collapsed by hand is left alone.
	 */
	private apply(leaf: WorkspaceLeaf | null): void {
		const { leftSplit, rightSplit } = this.app.workspace;
		if (!leftSplit || !rightSplit) return;

		if (this.isThinoActive(leaf)) {
			if (!leftSplit.collapsed) {
				leftSplit.collapse();
				this.hidLeft = true;
			}
			if (!rightSplit.collapsed) {
				rightSplit.collapse();
				this.hidRight = true;
			}
		} else {
			this.restore();
		}
	}

	private restore(): void {
		const { leftSplit, rightSplit } = this.app.workspace;
		if (!leftSplit || !rightSplit) return;
		if (this.hidLeft && leftSplit.collapsed) leftSplit.expand();
		if (this.hidRight && rightSplit.collapsed) rightSplit.expand();
		this.hidLeft = false;
		this.hidRight = false;
	}
}
