<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ToastHost from '$lib/components/ToastHost.svelte';
	import { layoutStore } from '$lib/stores/layout.js';

	let theme = 'dark';

	function handleThemeToggle(event) {
		theme = event.detail;
		applyTheme();
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('sam_api_theme', theme);
			} catch (e) {}
		}
	}

	function applyTheme() {
		if (typeof document !== 'undefined') {
			if (theme === 'light') {
				document.documentElement.setAttribute('data-theme', 'light');
			} else {
				document.documentElement.removeAttribute('data-theme');
			}
		}
	}

	onMount(async () => {
		try {
			const saved = localStorage.getItem('sam_api_theme');
			if (saved === 'light' || saved === 'dark') {
				theme = saved;
			} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
				theme = 'light';
			}
		} catch (e) {}
		applyTheme();

		try {
			const res = await fetch(`${base}/config/theme.json`);
			if (!res.ok) return;
			const configTheme = await res.json();
			const root = document.documentElement.style;
			if (configTheme.fonts?.display) root.setProperty('--font-display', configTheme.fonts.display);
			if (configTheme.fonts?.body) root.setProperty('--font-body', configTheme.fonts.body);
			if (configTheme.fonts?.mono) root.setProperty('--font-mono', configTheme.fonts.mono);
			if (configTheme.radius?.sm) root.setProperty('--radius-sm', configTheme.radius.sm);
			if (configTheme.radius?.md) root.setProperty('--radius-md', configTheme.radius.md);
			if (configTheme.radius?.lg) root.setProperty('--radius-lg', configTheme.radius.lg);
		} catch (e) {
			// Built-in defaults in app.css match
		}
	});
	// In row mode, synchronize row-mode class on documentElement for no page scroll
	$: if (typeof document !== 'undefined') {
		if ($layoutStore === 'row') {
			document.documentElement.classList.add('row-mode');
		} else {
			document.documentElement.classList.remove('row-mode');
		}
	}
</script>

<div class="shell" class:row-layout={$layoutStore === 'row'}>
	<Header
		{theme}
		on:toggleTheme={handleThemeToggle}
		on:resetAll
	/>

	<main class="site-main" class:wide-layout={$layoutStore === 'row'}>
		<slot />
	</main>

	{#if $layoutStore !== 'row'}
		<Footer />
	{:else}
		<!-- Compact 1-line status bar in Row view so cards have 100% viewport height without outer scroll -->
		<footer class="row-status-bar">
			<div class="status-left">
				<span class="status-dot"></span>
				<span class="status-text">SAM API Client · 100% In-Memory</span>
			</div>
			<div class="status-right">
				<span>Side-by-Side Row Mode · Native Fetch API</span>
			</div>
		</footer>
	{/if}
</div>

<ToastHost />

<style>
	.shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	.site-main {
		flex: 1;
		max-width: 1560px;
		width: 100%;
		margin: 0 auto;
		padding: 24px clamp(16px, 2.5vw, 36px) 0;
		transition: max-width 0.25s ease;
	}
	.site-main.wide-layout {
		max-width: 1820px;
	}

	@media (min-width: 1024px) {
		.shell.row-layout {
			height: 100vh;
			max-height: 100vh;
			overflow: hidden;
		}
		.shell.row-layout .site-main {
			padding: 16px clamp(16px, 2vw, 32px) 12px;
			overflow: hidden;
			display: flex;
			flex-direction: column;
			min-height: 0;
		}
	}

	.row-status-bar {
		flex-shrink: 0;
		height: 28px;
		border-top: 1px solid var(--border);
		background: var(--bg-elevated);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 clamp(16px, 2.5vw, 36px);
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--text-faint);
		z-index: 10;
	}
	.status-left {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--success);
	}
</style>
