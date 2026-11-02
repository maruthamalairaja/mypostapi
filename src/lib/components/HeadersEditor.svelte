<script>
	import { createEventDispatcher } from 'svelte';
	import { uid } from '$lib/utils/requestBuilder.js';
	import { SUGGESTED_HEADERS } from '$lib/utils/constants.js';
	import { isRestrictedHeader } from '$lib/utils/validators.js';

	export let headers = [];

	const dispatch = createEventDispatcher();
	let bulkMode = false;
	let bulkText = '';

	function addHeader(initialKey = '', initialVal = '') {
		headers = [
			...headers,
			{
				id: uid(),
				enabled: true,
				key: initialKey,
				value: initialVal,
				description: ''
			}
		];
		dispatchChange();
	}

	function removeHeader(index) {
		headers = headers.filter((_, i) => i !== index);
		dispatchChange();
	}

	function toggleHeader(index) {
		headers[index].enabled = !headers[index].enabled;
		headers = [...headers];
		dispatchChange();
	}

	function handleInput() {
		dispatchChange();
	}

	function dispatchChange() {
		dispatch('change', headers);
	}

	function applySuggested(item) {
		const existing = headers.find((h) => h.key.toLowerCase() === item.key.toLowerCase());
		if (existing) {
			existing.enabled = true;
			if (!existing.value && item.values.length > 0) {
				existing.value = item.values[0];
			}
			headers = [...headers];
		} else {
			addHeader(item.key, item.values.length > 0 ? item.values[0] : '');
		}
		dispatchChange();
	}

	function toggleBulk() {
		if (!bulkMode) {
			bulkText = headers
				.filter((h) => h.key || h.value)
				.map((h) => `${h.key}: ${h.value}`)
				.join('\n');
			bulkMode = true;
		} else {
			const lines = bulkText.split('\n');
			const parsed = [];
			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;
				const colonIdx = trimmed.indexOf(':');
				let key = '';
				let value = '';
				if (colonIdx !== -1) {
					key = trimmed.slice(0, colonIdx).trim();
					value = trimmed.slice(colonIdx + 1).trim();
				} else {
					key = trimmed;
					value = '';
				}
				parsed.push({
					id: uid(),
					enabled: true,
					key,
					value,
					description: ''
				});
			}
			headers = parsed.length > 0 ? parsed : [{ id: uid(), enabled: true, key: '', value: '', description: '' }];
			bulkMode = false;
			dispatchChange();
		}
	}

	function clearAll() {
		headers = [];
		dispatchChange();
	}
</script>

<div class="headers-editor">
	<div class="editor-header">
		<div class="header-left">
			<span class="section-title">Headers</span>
			<span class="count-badge">{headers.filter((h) => h.enabled && h.key).length} active</span>
		</div>
		<div class="header-actions">
			<button type="button" class="btn btn-ghost btn-sm" on:click={toggleBulk}>
				{bulkMode ? 'Key-Value Table' : 'Bulk Edit'}
			</button>
			{#if headers.length > 0}
				<button type="button" class="btn btn-ghost btn-sm" on:click={clearAll}>
					Clear
				</button>
			{/if}
			<button type="button" class="btn btn-sm btn-ghost add-btn" on:click={() => addHeader()}>
				+ Add Header
			</button>
		</div>
	</div>

	<!-- Suggestions Chips -->
	<div class="suggested-chips">
		<span class="chips-label">Suggestions:</span>
		{#each SUGGESTED_HEADERS as item}
			<button
				type="button"
				class="chip-btn"
				on:click={() => applySuggested(item)}
				title={item.restricted ? item.reason : `Add ${item.key}`}
			>
				<span>{item.key}</span>
				{#if item.restricted}
					<span class="restricted-dot" title="Browser restricted header">*</span>
				{/if}
			</button>
		{/each}
	</div>

	{#if bulkMode}
		<div class="bulk-container">
			<div class="bulk-hint">Enter headers as <code>Header-Name: Value</code>, one per line:</div>
			<textarea
				class="bulk-textarea"
				bind:value={bulkText}
				rows="6"
				placeholder="Content-Type: application/json&#10;Accept: application/json&#10;X-API-Key: your_key_here"
				spellcheck="false"
			></textarea>
		</div>
	{:else}
		<div class="table-wrapper">
			<table class="kv-table">
				<thead>
					<tr>
						<th class="col-check"></th>
						<th class="col-key">Header Key</th>
						<th class="col-val">Value</th>
						<th class="col-desc">Description</th>
						<th class="col-action"></th>
					</tr>
				</thead>
				<tbody>
					{#each headers as h, index (h.id)}
						{@const isRestricted = isRestrictedHeader(h.key)}
						<tr class:row-disabled={!h.enabled} class:row-restricted={isRestricted}>
							<td class="col-check">
								<label class="switch-toggle" title="Enable / Disable header">
									<input
										type="checkbox"
										checked={h.enabled}
										on:change={() => toggleHeader(index)}
									/>
									<span class="switch-track">
										<span class="switch-thumb"></span>
									</span>
								</label>
							</td>
							<td class="col-key">
								<div class="key-field">
									<input
										type="text"
										class="table-input key-input"
										placeholder="e.g. Content-Type"
										bind:value={h.key}
										on:input={handleInput}
										spellcheck="false"
									/>
									{#if isRestricted}
										<span
											class="restricted-badge"
											title="Browser security forbids or overrides this header via Fetch API"
										>
											Restricted
										</span>
									{/if}
								</div>
							</td>
							<td class="col-val">
								<input
									type="text"
									class="table-input"
									placeholder="Value"
									bind:value={h.value}
									on:input={handleInput}
									spellcheck="false"
								/>
							</td>
							<td class="col-desc">
								<input
									type="text"
									class="table-input desc-input"
									placeholder="Description (optional)"
									bind:value={h.description}
									on:input={handleInput}
								/>
							</td>
							<td class="col-action">
								<button
									type="button"
									class="delete-row-btn"
									on:click={() => removeHeader(index)}
									title="Delete header"
									aria-label="Delete header"
								>
									&times;
								</button>
							</td>
						</tr>
					{/each}
					{#if headers.length === 0}
						<tr>
							<td colspan="5" class="empty-state">
								No custom headers configured. <button type="button" class="link-btn" on:click={() => addHeader()}>Add one</button> or click a suggestion above.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.headers-editor {
		display: flex;
		flex-direction: column;
		gap: 12px;
		flex: 1;
		min-height: 0;
	}
	.editor-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		flex-shrink: 0;
	}
	.header-left {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.section-title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 13.5px;
		color: var(--text);
	}
	.count-badge {
		font-family: var(--font-mono);
		font-size: 11px;
		background: var(--bg-surface);
		color: var(--text-muted);
		padding: 2px 7px;
		border-radius: 999px;
		border: 1px solid var(--border);
	}
	.header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.add-btn {
		color: var(--accent);
		border-color: var(--border-strong);
	}
	.suggested-chips {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}
	.chips-label {
		font-size: 11.5px;
		color: var(--text-muted);
		font-family: var(--font-display);
	}
	.chip-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		color: var(--text-muted);
		padding: 3px 8px;
		border-radius: var(--radius-sm);
		font-size: 11.5px;
		font-family: var(--font-mono);
		cursor: pointer;
		transition: all 0.12s;
	}
	.chip-btn:hover {
		border-color: var(--accent);
		color: var(--text);
		background: var(--accent-soft);
	}
	.restricted-dot {
		color: var(--warning);
		font-weight: bold;
	}
	.table-wrapper {
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		overflow: auto;
		background: var(--bg-inset);
		flex: 1;
		min-height: 120px;
	}
	.kv-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
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
		padding: 4px 8px;
		border-bottom: 1px solid var(--border);
	}
	tbody tr:last-child td {
		border-bottom: 0;
	}
	.col-check {
		width: 44px;
		text-align: center;
		padding: 4px 6px;
	}
	.col-key {
		width: 32%;
	}
	.col-val {
		width: 32%;
	}
	.col-desc {
		width: 30%;
	}
	.col-action {
		width: 36px;
		text-align: center;
	}
	.key-field {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.table-input {
		width: 100%;
		height: 32px;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		padding: 0 8px;
		font-size: 13px;
		color: var(--text);
		outline: none;
	}
	.table-input:hover {
		border-color: var(--border);
	}
	.table-input:focus {
		border-color: var(--accent);
		background: var(--bg-elevated);
	}
	.key-input {
		font-family: var(--font-mono);
		font-weight: 500;
	}
	.desc-input {
		color: var(--text-muted);
		font-size: 12px;
	}
	.restricted-badge {
		font-size: 9.5px;
		font-family: var(--font-mono);
		background: rgba(245, 158, 11, 0.15);
		color: var(--warning);
		border: 1px solid rgba(245, 158, 11, 0.3);
		padding: 1px 5px;
		border-radius: 3px;
		white-space: nowrap;
	}
	.row-disabled {
		opacity: 0.55;
	}
	.delete-row-btn {
		background: transparent;
		border: 0;
		color: var(--text-faint);
		font-size: 18px;
		line-height: 1;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 4px;
	}
	.delete-row-btn:hover {
		color: var(--danger);
		background: rgba(239, 68, 68, 0.15);
	}
	.empty-state {
		text-align: center;
		padding: 24px;
		color: var(--text-muted);
		font-size: 13px;
	}
	.link-btn {
		background: none;
		border: none;
		color: var(--accent);
		text-decoration: underline;
		cursor: pointer;
		padding: 0;
		font: inherit;
	}
	.bulk-container {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.bulk-hint {
		font-size: 12px;
		color: var(--text-muted);
	}
	.bulk-hint code {
		font-family: var(--font-mono);
		background: var(--bg-surface);
		padding: 1px 4px;
		border-radius: 3px;
		color: var(--accent-strong);
	}
	.bulk-textarea {
		width: 100%;
		background: var(--bg-inset);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 10px 12px;
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--text);
		line-height: 1.5;
		outline: none;
		resize: vertical;
	}
	.bulk-textarea:focus {
		border-color: var(--accent);
	}
</style>

