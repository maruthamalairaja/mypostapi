<script>
	import { createEventDispatcher } from 'svelte';
	import { uid } from '$lib/utils/requestBuilder.js';

	export let params = [];
	export let resolvedUrl = '';

	const dispatch = createEventDispatcher();
	let bulkMode = false;
	let bulkText = '';

	function addParam() {
		params = [...params, { id: uid(), enabled: true, key: '', value: '', description: '' }];
		dispatchChange();
	}

	function removeParam(index) {
		params = params.filter((_, i) => i !== index);
		dispatchChange();
	}

	function toggleParam(index) {
		params[index].enabled = !params[index].enabled;
		params = [...params];
		dispatchChange();
	}

	function handleInput() {
		dispatchChange();
	}

	function dispatchChange() {
		dispatch('change', params);
	}

	function toggleBulk() {
		if (!bulkMode) {
			// Convert params to key:value lines
			bulkText = params
				.filter((p) => p.key || p.value)
				.map((p) => `${p.key}:${p.value}`)
				.join('\n');
			bulkMode = true;
		} else {
			// Parse bulk text back to params
			const lines = bulkText.split('\n');
			const parsed = [];
			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;
				const colonIdx = trimmed.indexOf(':');
				const eqIdx = trimmed.indexOf('=');
				let key = '';
				let value = '';
				if (colonIdx !== -1 && (eqIdx === -1 || colonIdx < eqIdx)) {
					key = trimmed.slice(0, colonIdx).trim();
					value = trimmed.slice(colonIdx + 1).trim();
				} else if (eqIdx !== -1) {
					key = trimmed.slice(0, eqIdx).trim();
					value = trimmed.slice(eqIdx + 1).trim();
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
			params = parsed.length > 0 ? parsed : [{ id: uid(), enabled: true, key: '', value: '', description: '' }];
			bulkMode = false;
			dispatchChange();
		}
	}

	function clearAll() {
		params = [];
		dispatchChange();
	}
</script>

<div class="params-editor">
	<div class="editor-header">
		<div class="header-left">
			<span class="section-title">Query Parameters</span>
			<span class="count-badge">{params.filter((p) => p.enabled && p.key).length} active</span>
		</div>
		<div class="header-actions">
			<button
				type="button"
				class="btn btn-ghost btn-sm"
				on:click={toggleBulk}
			>
				{bulkMode ? 'Key-Value Table' : 'Bulk Edit'}
			</button>
			{#if params.length > 0}
				<button type="button" class="btn btn-ghost btn-sm" on:click={clearAll}>
					Clear
				</button>
			{/if}
			<button type="button" class="btn btn-sm btn-ghost add-btn" on:click={addParam}>
				+ Add Param
			</button>
		</div>
	</div>

	{#if bulkMode}
		<div class="bulk-container">
			<div class="bulk-hint">Enter parameters as <code>key:value</code> or <code>key=value</code>, one per line:</div>
			<textarea
				class="bulk-textarea"
				bind:value={bulkText}
				rows="6"
				placeholder="employee_id: EMP001&#10;department: IT&#10;status: Active"
				spellcheck="false"
			></textarea>
		</div>
	{:else}
		<div class="table-wrapper">
			<table class="kv-table">
				<thead>
					<tr>
						<th class="col-check"></th>
						<th class="col-key">Key</th>
						<th class="col-val">Value</th>
						<th class="col-desc">Description</th>
						<th class="col-action"></th>
					</tr>
				</thead>
				<tbody>
					{#each params as p, index (p.id)}
						<tr class:row-disabled={!p.enabled}>
							<td class="col-check">
								<label class="switch-toggle" title="Enable / Disable parameter">
									<input
										type="checkbox"
										checked={p.enabled}
										on:change={() => toggleParam(index)}
									/>
									<span class="switch-track">
										<span class="switch-thumb"></span>
									</span>
								</label>
							</td>
							<td class="col-key">
								<input
									type="text"
									class="table-input key-input"
									placeholder="Parameter key"
									bind:value={p.key}
									on:input={handleInput}
									spellcheck="false"
								/>
							</td>
							<td class="col-val">
								<input
									type="text"
									class="table-input"
									placeholder="Value"
									bind:value={p.value}
									on:input={handleInput}
									spellcheck="false"
								/>
							</td>
							<td class="col-desc">
								<input
									type="text"
									class="table-input desc-input"
									placeholder="Description (optional)"
									bind:value={p.description}
									on:input={handleInput}
								/>
							</td>
							<td class="col-action">
								<button
									type="button"
									class="delete-row-btn"
									on:click={() => removeParam(index)}
									title="Delete row"
									aria-label="Delete parameter"
								>
									&times;
								</button>
							</td>
						</tr>
					{/each}
					{#if params.length === 0}
						<tr>
							<td colspan="5" class="empty-state">
								No query parameters added. <button type="button" class="link-btn" on:click={addParam}>Add one</button> or type in the URL bar above.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	{/if}

	{#if resolvedUrl}
		<div class="resolved-url-preview">
			<span class="preview-label">Final Resolved URL:</span>
			<span class="preview-text" title={resolvedUrl}>{resolvedUrl}</span>
		</div>
	{/if}
</div>

<style>
	.params-editor {
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
	.resolved-url-preview {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		padding: 6px 12px;
		border-radius: var(--radius-sm);
		font-size: 12px;
		overflow: hidden;
	}
	.preview-label {
		font-family: var(--font-display);
		font-weight: 600;
		color: var(--text-muted);
		flex-shrink: 0;
	}
	.preview-text {
		font-family: var(--font-mono);
		color: var(--accent);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>

