<script>
	import { toast } from '$lib/stores/toast.js';

	export let response;

	let wordWrap = true;

	async function copyRaw() {
		try {
			await navigator.clipboard.writeText(response.rawText || '');
			toast('Response copied to clipboard', 'success', 2000);
		} catch (e) {
			toast('Failed to copy', 'error', 2000);
		}
	}
</script>

<div class="raw-viewer">
	<div class="raw-toolbar">
		<label class="wrap-toggle switch-toggle">
			<input type="checkbox" bind:checked={wordWrap} />
			<span class="switch-track">
				<span class="switch-thumb"></span>
			</span>
			<span class="wrap-toggle-label">Wrap long lines</span>
		</label>
		<button type="button" class="btn btn-ghost btn-sm" on:click={copyRaw} title="Copy full response text">
			<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
				<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
			</svg>
			<span>Copy Raw</span>
		</button>
	</div>

	<div class="raw-container">
		<pre class="raw-pre" class:no-wrap={!wordWrap}>{response.rawText || '(Empty response)'}</pre>
	</div>
</div>

<style>
	.raw-viewer {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
		flex: 1;
		min-height: 0;
	}
	.raw-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
	}
	.wrap-toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		color: var(--text-muted);
		cursor: pointer;
	}
	.wrap-toggle-label {
		user-select: none;
	}
	.raw-container {
		background: var(--bg-inset);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 14px 16px;
		flex: 1;
		min-height: 200px;
		overflow: auto;
	}
	.raw-pre {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 1.5;
		color: var(--text);
		white-space: pre-wrap;
		word-break: break-word;
	}
	.raw-pre.no-wrap {
		white-space: pre;
		word-break: normal;
	}
</style>

