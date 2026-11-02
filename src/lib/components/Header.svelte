<script>
	import { createEventDispatcher } from 'svelte';
	import { base } from '$app/paths';
	import { layoutStore } from '$lib/stores/layout.js';

	export let theme = 'dark';

	const dispatch = createEventDispatcher();

	function toggleTheme() {
		const next = theme === 'dark' ? 'light' : 'dark';
		dispatch('toggleTheme', next);
	}

	function handleReset() {
		if (confirm('Clear all request data, parameters, headers, and response?')) {
			dispatch('resetAll');
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('resetAll'));
			}
		}
	}
</script>

<header class="site-header">
	<div class="header-inner">
		<div class="brand-group">
			<a class="brand-mark" href="{base}/" aria-label="SAM API Client">
				<span class="glyph" aria-hidden="true">
					<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
						<rect width="28" height="28" rx="8" fill="var(--accent-soft)" />
						<rect x="0.5" y="0.5" width="27" height="27" rx="7.5" stroke="var(--border-strong)" />
						<path d="M7 14h10m0 0l-3.5-3.5M17 14l-3.5 3.5" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
						<circle cx="21" cy="14" r="2" fill="var(--accent-strong)" />
					</svg>
				</span>
				<span class="brand-text">
					<span class="brand-title">SAM API Client</span>
					<span class="brand-sub">API Request & Response Tester</span>
				</span>
			</a>
			<div class="security-badge" title="Requests run strictly client-side. No history or credentials are saved.">
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
					<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
				</svg>
				<span>100% Client-Side · In-Memory Only</span>
			</div>
		</div>

		<div class="header-actions">
			<!-- Column & Row Layout Options -->
			<div class="layout-toggle-group" role="group" aria-label="Layout view mode">
				<button
					type="button"
					class="layout-btn"
					class:active={$layoutStore === 'column'}
					on:click={() => layoutStore.setLayout('column')}
					title="Column View (Stacked Top & Bottom)"
					aria-label="Stacked Column View"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="3" width="18" height="7" rx="1.5"></rect>
						<rect x="3" y="14" width="18" height="7" rx="1.5"></rect>
					</svg>
					<span class="layout-label">Column</span>
				</button>
				<button
					type="button"
					class="layout-btn"
					class:active={$layoutStore === 'row'}
					on:click={() => layoutStore.setLayout('row')}
					title="Row View (Side-by-Side Left & Right)"
					aria-label="Side-by-Side Row View"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="3" width="7" height="18" rx="1.5"></rect>
						<rect x="14" y="3" width="7" height="18" rx="1.5"></rect>
					</svg>
					<span class="layout-label">Row</span>
				</button>
			</div>

			<button
				type="button"
				class="btn btn-ghost btn-sm"
				on:click={handleReset}
				title="Reset all current form data and state"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="1 4 1 10 7 10"></polyline>
					<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
				</svg>
				<span>Clear All</span>
			</button>

			<button
				type="button"
				class="theme-toggle"
				on:click={toggleTheme}
				aria-label="Toggle theme: current {theme}"
				title="Switch to {theme === 'dark' ? 'Light' : 'Dark'} mode"
			>
				{#if theme === 'dark'}
					<!-- Sun icon -->
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="5"></circle>
						<line x1="12" y1="1" x2="12" y2="3"></line>
						<line x1="12" y1="21" x2="12" y2="23"></line>
						<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
						<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
						<line x1="1" y1="12" x2="3" y2="12"></line>
						<line x1="21" y1="12" x2="23" y2="12"></line>
						<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
						<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
					</svg>
				{:else}
					<!-- Moon icon -->
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
					</svg>
				{/if}
			</button>
		</div>
	</div>
</header>

<style>
	.site-header {
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		z-index: 50;
		background: rgba(15, 10, 10, 0.85);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}
	:global([data-theme='light']) .site-header {
		background: rgba(252, 249, 249, 0.88);
	}
	.header-inner {
		width: 100%;
		max-width: 1560px;
		margin: 0 auto;
		padding: 12px clamp(16px, 2.5vw, 36px);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}
	.brand-group {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	}
	.brand-mark {
		display: inline-flex;
		align-items: center;
		gap: 11px;
		text-decoration: none;
	}
	.glyph {
		display: flex;
		flex-shrink: 0;
	}
	.brand-text {
		display: flex;
		flex-direction: column;
		line-height: 1.25;
	}
	.brand-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 16px;
		color: var(--text);
		letter-spacing: -0.01em;
	}
	.brand-sub {
		font-family: var(--font-mono);
		font-size: 10.5px;
		letter-spacing: 0.04em;
		color: var(--text-muted);
	}
	.security-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: var(--accent-soft);
		border: 1px solid var(--border-strong);
		padding: 3px 9px;
		border-radius: 999px;
		font-size: 11px;
		font-family: var(--font-mono);
		color: var(--accent-strong);
	}
	.header-actions {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.layout-toggle-group {
		display: inline-flex;
		align-items: center;
		background: var(--bg-inset);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-sm);
		padding: 2px;
		gap: 2px;
	}
	.layout-btn {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 9px;
		background: transparent;
		border: 0;
		border-radius: 4px;
		color: var(--text-muted);
		font-family: var(--font-display);
		font-size: 11.5px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
		line-height: 1;
	}
	.layout-btn:hover {
		color: var(--text);
		background: var(--bg-surface);
	}
	.layout-btn.active {
		background: var(--accent);
		color: #ffffff;
		box-shadow: 0 1px 4px var(--accent-glow);
	}
	@media (max-width: 520px) {
		.layout-label {
			display: none;
		}
	}
	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-strong);
		background: var(--bg-inset);
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.theme-toggle:hover {
		border-color: var(--accent);
		color: var(--accent-strong);
		background: var(--bg-surface);
	}
	@media (max-width: 680px) {
		.security-badge {
			display: none;
		}
	}
</style>
