<script>
	import { toast } from '$lib/stores/toast.js';

	export let headers = [];

	let search = '';

	$: filtered = search.trim()
		? headers.filter(
				(h) =>
					h.key.toLowerCase().includes(search.toLowerCase()) ||
					h.value.toLowerCase().includes(search.toLowerCase())
		  )
		: headers;

	async function copyValue(val) {
		try {
			await navigator.clipboard.writeText(val);
			toast('Header value copied', 'info', 1500);
		} catch (e) {}
	}

	async function copyAllHeaders() {
		try {
			const str = headers.map((h) => `${h.key}: ${h.value}`).join('\n');
			await navigator.clipboard.writeText(str);
			toast('All response headers copied', 'success', 2000);
		} catch (e) {}
	}
</script>

<div class="headers-viewer">
	<div class="headers-toolbar">
		<div class="search-box">
			<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="11" cy="11" r="8"></circle>
				<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
			</svg>
			<input
				type="text"
				placeholder="Filter headers..."
				class="search-input"
				bind:value={search}
				spellcheck="false"
			/>
		</div>
		<button type="button" class="btn btn-ghost btn-sm" on:click={copyAllHeaders}>
			Copy All Headers
		</button>
	</div>

	<div class="table-wrapper">
		<table class="headers-table">
			<thead>
				<tr>
					<th class="col-key">Header Key</th>
					<th class="col-val">Value</th>
					<th class="col-act"></th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as h}
					<tr>
						<td class="col-key">
							<span class="header-key">{h.key}</span>
						</td>
						<td class="col-val">
							<span class="header-val">{h.value}</span>
						</td>
						<td class="col-act">
							<button
								type="button"
								class="copy-btn"
								on:click={() => copyValue(h.value)}
								title="Copy value"
								aria-label="Copy header value"
							>
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
									<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
								</svg>
							</button>
						</td>
					</tr>
				{/each}
				{#if filtered.length === 0}
					<tr>
						<td colspan="3" class="empty-state">
							{headers.length === 0 ? 'No response headers available.' : 'No matching headers found.'}
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

<style>
	.headers-viewer {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
		flex: 1;
		min-height: 0;
	}
	.headers-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		flex-shrink: 0;
	}
	.search-box {
		display: flex;
		align-items: center;
		gap: 6px;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 4px 10px;
		color: var(--text-muted);
		width: 240px;
	}
	.search-input {
		background: transparent;
		border: 0;
		outline: none;
		color: var(--text);
		font-size: 12px;
		font-family: var(--font-body);
		width: 100%;
	}
	.table-wrapper {
		background: var(--bg-inset);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		flex: 1;
		min-height: 200px;
		overflow: auto;
	}
	.headers-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 12.5px;
	}
	th {
		text-align: left;
		padding: 8px 12px;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 11.5px;
		color: var(--text-muted);
		background: var(--bg-surface);
		border-bottom: 1px solid var(--border);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	td {
		padding: 7px 12px;
		border-bottom: 1px solid var(--border);
	}
	tbody tr:last-child td {
		border-bottom: 0;
	}
	.col-key {
		width: 35%;
		font-family: var(--font-mono);
		font-weight: 600;
		color: var(--accent);
	}
	.col-val {
		width: 60%;
		font-family: var(--font-mono);
		color: var(--text);
		word-break: break-all;
	}
	.col-act {
		width: 32px;
		text-align: center;
	}
	.copy-btn {
		background: transparent;
		border: 0;
		color: var(--text-faint);
		cursor: pointer;
		padding: 3px;
		border-radius: 3px;
	}
	.copy-btn:hover {
		color: var(--text);
		background: var(--bg-surface);
	}
	.empty-state {
		text-align: center;
		padding: 24px;
		color: var(--text-muted);
	}
</style>

