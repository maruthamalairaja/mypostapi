<script>
	import JsonTree from './JsonTree.svelte';
	import { highlightJson } from '$lib/utils/formatters.js';

	export let response;

	let viewMode = 'code'; // 'code' | 'tree'
	let defaultCollapsed = false;

	$: highlighted = response.isJson && response.jsonData
		? highlightJson(response.jsonData)
		: null;
</script>

<div class="pretty-viewer">
	{#if response.isJson && response.jsonData}
		<div class="pretty-toolbar">
			<div class="view-toggles">
				<button
					type="button"
					class="toggle-btn"
					class:active={viewMode === 'code'}
					on:click={() => (viewMode = 'code')}
				>
					Highlighted Code
				</button>
				<button
					type="button"
					class="toggle-btn"
					class:active={viewMode === 'tree'}
					on:click={() => (viewMode = 'tree')}
				>
					Interactive Tree
				</button>
			</div>

			{#if viewMode === 'tree'}
				<div class="tree-controls">
					<button
						type="button"
						class="btn btn-ghost btn-sm"
						on:click={() => (defaultCollapsed = !defaultCollapsed)}
					>
						{defaultCollapsed ? 'Expand Nodes' : 'Collapse Deep Nodes'}
					</button>
				</div>
			{/if}
		</div>

		{#if viewMode === 'code'}
			<div class="code-container">
				<pre class="highlighted-pre">{@html highlighted}</pre>
			</div>
		{:else}
			<div class="tree-container">
				<JsonTree data={response.jsonData} {defaultCollapsed} />
			</div>
		{/if}
	{:else}
		<!-- Fallback text / XML / HTML readable viewer -->
		<div class="code-container">
			<pre class="plain-pre">{response.rawText || '(Empty Response Body)'}</pre>
		</div>
	{/if}
</div>

<style>
	.pretty-viewer {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
		flex: 1;
		min-height: 0;
	}
	.pretty-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		flex-shrink: 0;
	}
	.view-toggles {
		display: flex;
		align-items: center;
		gap: 4px;
		background: var(--bg-surface);
		padding: 3px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
	}
	.toggle-btn {
		background: transparent;
		border: 0;
		color: var(--text-muted);
		padding: 5px 12px;
		font-family: var(--font-display);
		font-size: 12px;
		font-weight: 600;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.toggle-btn:hover {
		color: var(--text);
	}
	.toggle-btn.active {
		background: var(--accent);
		color: #ffffff;
		box-shadow: 0 1px 4px var(--accent-glow);
	}
	.code-container,
	.tree-container {
		background: var(--bg-inset);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 14px 16px;
		flex: 1;
		min-height: 200px;
		overflow: auto;
	}
	.highlighted-pre,
	.plain-pre {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 1.55;
		color: var(--text);
		white-space: pre-wrap;
		word-break: break-word;
	}
	:global(.json-key) {
		color: var(--syntax-key);
		font-weight: 600;
	}
	:global(.json-string) {
		color: var(--syntax-string);
	}
	:global(.json-number) {
		color: var(--syntax-number);
	}
	:global(.json-boolean) {
		color: var(--syntax-boolean);
		font-weight: 600;
	}
	:global(.json-null) {
		color: var(--syntax-null);
		font-style: italic;
	}
</style>

