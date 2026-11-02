<script>
	export let data;
	export let keyName = '';
	export let depth = 0;
	export let defaultCollapsed = false;

	let collapsed = depth > 2 ? true : defaultCollapsed;

	$: isObject = data !== null && typeof data === 'object' && !Array.isArray(data);
	$: isArray = Array.isArray(data);
	$: isComplex = isObject || isArray;
	$: entries = isObject ? Object.entries(data) : isArray ? data.map((v, i) => [i, v]) : [];
	$: itemCount = entries.length;

	function toggle() {
		collapsed = !collapsed;
	}

	function getValueClass(val) {
		if (val === null) return 'val-null';
		const t = typeof val;
		if (t === 'string') return 'val-string';
		if (t === 'number') return 'val-number';
		if (t === 'boolean') return 'val-boolean';
		return '';
	}

	function formatPrimitive(val) {
		if (val === null) return 'null';
		if (typeof val === 'string') return `"${val}"`;
		return String(val);
	}
</script>

<div class="tree-node" style="--depth: {depth};">
	{#if isComplex}
		<div class="node-row" on:click={toggle} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && toggle()}>
			<button type="button" class="toggle-btn" aria-label="Toggle node">
				<svg class="chevron" class:rotated={!collapsed} width="10" height="6" viewBox="0 0 10 6" fill="none">
					<path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>

			{#if keyName !== ''}
				<span class="node-key">"{keyName}":</span>
			{/if}

			<span class="bracket-open">{isArray ? '[' : '{'}</span>
			{#if collapsed}
				<span class="collapsed-ellipsis">...</span>
				<span class="bracket-close">{isArray ? ']' : '}'}</span>
				<span class="item-count">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
			{/if}
		</div>

		{#if !collapsed}
			<div class="node-children">
				{#each entries as [childKey, childVal]}
					<svelte:self
						data={childVal}
						keyName={childKey}
						depth={depth + 1}
						{defaultCollapsed}
					/>
				{/each}
			</div>
			<div class="node-closing">
				<span class="bracket-close">{isArray ? ']' : '}'}</span>
			</div>
		{/if}
	{:else}
		<div class="primitive-row">
			{#if keyName !== ''}
				<span class="node-key">"{keyName}":</span>
			{/if}
			<span class="node-val {getValueClass(data)}">{formatPrimitive(data)}</span>
		</div>
	{/if}
</div>

<style>
	.tree-node {
		font-family: var(--font-mono);
		font-size: 12.5px;
		line-height: 1.6;
	}
	.node-row {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		cursor: pointer;
		user-select: none;
		border-radius: 3px;
		padding: 1px 4px;
	}
	.node-row:hover {
		background: var(--bg-surface);
	}
	.toggle-btn {
		background: none;
		border: none;
		padding: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--text-faint);
		cursor: pointer;
		width: 14px;
		height: 14px;
	}
	.chevron {
		transition: transform 0.12s ease;
		transform: rotate(-90deg);
	}
	.chevron.rotated {
		transform: rotate(0deg);
	}
	.node-key {
		color: var(--accent);
		font-weight: 500;
	}
	.bracket-open,
	.bracket-close {
		color: var(--text-muted);
		font-weight: 600;
	}
	.collapsed-ellipsis {
		color: var(--text-faint);
		padding: 0 4px;
	}
	.item-count {
		font-size: 11px;
		color: var(--text-faint);
		font-style: italic;
		margin-left: 4px;
	}
	.node-children {
		padding-left: 20px;
		border-left: 1px dashed var(--border);
		margin-left: 7px;
	}
	.node-closing {
		padding-left: 19px;
	}
	.primitive-row {
		display: flex;
		align-items: baseline;
		gap: 6px;
		padding: 1px 4px 1px 19px;
	}
	.node-val {
		word-break: break-all;
	}
	.val-string {
		color: var(--syntax-string);
	}
	.val-number {
		color: var(--syntax-number);
	}
	.val-boolean {
		color: var(--syntax-boolean);
		font-weight: 600;
	}
	.val-null {
		color: var(--syntax-null);
		font-style: italic;
	}
</style>

