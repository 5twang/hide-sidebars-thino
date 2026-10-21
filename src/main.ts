import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceLeaf,
} from 'obsidian';

/**
 * View types registered by the Thino plugin (obsidian-memos) that represent a
 * Thino workspace of their own. The changelog view is deliberately excluded.
 */
const THINO_VIEW_TYPES = ['thino_view', 'thino-super-view'];

/**
 * Window width (px) below which the sidebars are collapsed while a Thino view
 * is active. On wider windows the sidebars stay open so the extra room is not
 * wasted hiding panes the user still wants to see. Configurable in settings.
 */
const DEFAULT_WIDTH_THRESHOLD = 1200;

interface HideSidebarsInThinoSettings {
	widthThreshold: number;
}

const DEFAULT_SETTINGS: HideSidebarsInThinoSettings = {
	widthThreshold: DEFAULT_WIDTH_THRESHOLD,
};

export default class HideSidebarsInThino extends Plugin {
	settings: HideSidebarsInThinoSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new HideSidebarsInThinoSettingTab(this.app, this));

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

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	private isThinoActive(leaf: WorkspaceLeaf | null): boolean {
		const type = leaf?.view?.getViewType();
		return type !== undefined && THINO_VIEW_TYPES.includes(type);
	}

	/**
	 * Runs whenever the active tab changes, the window is resized, or the width
	 * threshold setting is changed. Both sidebars are collapsed while a Thino
	 * view is active on a window narrower than the threshold, and expanded
	 * again otherwise. Sidebars are only touched on those events, so opening or
	 * closing one by hand stays as you left it until the next such event.
	 */
	apply(leaf: WorkspaceLeaf | null): void {
		const shouldHide =
			this.isThinoActive(leaf) &&
			window.innerWidth < this.settings.widthThreshold;
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

class HideSidebarsInThinoSettingTab extends PluginSettingTab {
	plugin: HideSidebarsInThino;

	constructor(app: App, plugin: HideSidebarsInThino) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Width threshold (px)')
			.setDesc(
				'Collapse the sidebars while a Thino view is active when the window is narrower than this value. On wider windows the sidebars stay open.'
			)
			.addText((text) => {
				text.inputEl.type = 'number';
				text.setPlaceholder(String(DEFAULT_WIDTH_THRESHOLD))
					.setValue(String(this.plugin.settings.widthThreshold))
					.onChange(async (value) => {
						const parsed = Number.parseInt(value, 10);
						if (!Number.isFinite(parsed) || parsed <= 0) {
							text.inputEl.addClass('setting-error');
							return;
						}
						text.inputEl.removeClass('setting-error');
						this.plugin.settings.widthThreshold = parsed;
						await this.plugin.saveSettings();
						this.plugin.apply(this.app.workspace.getMostRecentLeaf());
					});
			});
	}
}
