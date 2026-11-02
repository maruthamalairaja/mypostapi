<script>
	import { createEventDispatcher } from 'svelte';
	import { BODY_TYPES } from '$lib/utils/constants.js';
	import { formatJson, minifyJson, formatXml, formatBytes } from '$lib/utils/formatters.js';
	import { validateJson, validateXml } from '$lib/utils/validators.js';
	import { uid } from '$lib/utils/requestBuilder.js';
	import { toast } from '$lib/stores/toast.js';
	import CustomSelect from '$lib/components/CustomSelect.svelte';

	export let bodyType = 'none';
	export let bodyData = {
		raw: '',
		urlencoded: [],
		multipart: [],
		binaryFile: null
	};
	export let isBodyValid = true;

	const dispatch = createEventDispatcher();
	let validationError = null;

	// Validation reactively on changes
	$: {
		if (bodyType === 'json') {
			const res = validateJson(bodyData.raw);
			if (!res.valid) {
				validationError = `JSON Error at Line ${res.line}, Col ${res.column}: ${res.error}`;
				isBodyValid = false;
			} else {
				validationError = null;
				isBodyValid = true;
			}
		} else if (bodyType === 'xml') {
			const res = validateXml(bodyData.raw);
			if (!res.valid) {
				validationError = `XML Error: ${res.error}`;
				isBodyValid = false;
			} else {
				validationError = null;
				isBodyValid = true;
			}
		} else {
			validationError = null;
			isBodyValid = true;
		}
		dispatch('validityChange', isBodyValid);
	}

	function handleTypeChange(typeId) {
		bodyType = typeId;
		dispatch('typeChange', bodyType);
	}

	function handleFormatJson() {
		const res = formatJson(bodyData.raw);
		if (res.success) {
			bodyData.raw = res.formatted;
			toast('JSON formatted successfully', 'success', 2000);
		} else {
			toast(`Cannot format: ${res.error}`, 'error', 3000);
		}
	}

	function handleMinifyJson() {
		const res = minifyJson(bodyData.raw);
		if (res.success) {
			bodyData.raw = res.minified;
			toast('JSON minified', 'success', 2000);
		} else {
			toast(`Cannot minify: ${res.error}`, 'error', 3000);
		}
	}

	function handleFormatXml() {
		bodyData.raw = formatXml(bodyData.raw);
		toast('XML formatted', 'success', 2000);
	}

	function handleValidate() {
		if (bodyType === 'json') {
			const res = validateJson(bodyData.raw);
			if (res.valid) {
				toast('Valid JSON syntax ✓', 'success', 2500);
			} else {
				toast(`Line ${res.line}, Col ${res.column}: ${res.error}`, 'error', 4000);
			}
		} else if (bodyType === 'xml') {
			const res = validateXml(bodyData.raw);
			if (res.valid) {
				toast('Valid XML structure ✓', 'success', 2500);
			} else {
				toast(`XML Error: ${res.error}`, 'error', 4000);
			}
		}
	}

	function handleClearRaw() {
		bodyData.raw = '';
		toast('Body cleared', 'info', 1500);
	}

	// URL Encoded methods
	function addUrlEncodedRow() {
		bodyData.urlencoded = [
			...(bodyData.urlencoded || []),
			{ id: uid(), enabled: true, key: '', value: '' }
		];
	}

	function removeUrlEncodedRow(idx) {
		bodyData.urlencoded = bodyData.urlencoded.filter((_, i) => i !== idx);
	}

	// Multipart methods
	function addMultipartRow() {
		bodyData.multipart = [
			...(bodyData.multipart || []),
			{ id: uid(), enabled: true, key: '', type: 'text', value: '', file: null }
		];
	}

	function removeMultipartRow(idx) {
		bodyData.multipart = bodyData.multipart.filter((_, i) => i !== idx);
	}

	function handleMultipartFile(e, row) {
		const file = e.target.files?.[0];
		if (file) {
			row.file = file;
			row.value = file.name;
			bodyData = { ...bodyData };
		}
	}

	// Binary file
	function handleBinaryFileSelect(e) {
		const file = e.target.files?.[0];
		if (file) {
			bodyData.binaryFile = file;
			bodyData = { ...bodyData };
			toast(`Selected ${file.name} (${formatBytes(file.size)})`, 'info', 2500);
		}
	}

	function clearBinaryFile() {
		bodyData.binaryFile = null;
		bodyData = { ...bodyData };
	}
</script>

<div class="body-editor">
	<!-- Body Type Pills -->
	<div class="body-types-bar">
		<span class="type-label">Format:</span>
		<div class="type-pills">
			{#each BODY_TYPES as t}
				<button
					type="button"
					class="type-pill"
					class:active={bodyType === t.id}
					on:click={() => handleTypeChange(t.id)}
				>
					{t.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Body Type Specific View -->
	{#if bodyType === 'none'}
		<div class="empty-body-notice">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
			</svg>
			<span>This request does not have a body. Select a body format above to include payload data.</span>
		</div>
	{:else if ['json', 'text', 'xml', 'html', 'javascript'].includes(bodyType)}
		<div class="raw-editor-container">
			<div class="editor-toolbar">
				<div class="toolbar-left">
					<span class="mime-hint">{BODY_TYPES.find((b) => b.id === bodyType)?.contentType || 'Raw text'}</span>
				</div>
				<div class="toolbar-actions">
					{#if bodyType === 'json'}
						<button type="button" class="btn btn-ghost btn-sm" on:click={handleFormatJson} title="Pretty-print JSON (2 spaces)">
							Format
						</button>
						<button type="button" class="btn btn-ghost btn-sm" on:click={handleMinifyJson} title="Minify JSON">
							Minify
						</button>
						<button type="button" class="btn btn-ghost btn-sm" on:click={handleValidate} title="Validate JSON syntax">
							Validate
						</button>
					{:else if bodyType === 'xml'}
						<button type="button" class="btn btn-ghost btn-sm" on:click={handleFormatXml} title="Format XML">
							Format
						</button>
						<button type="button" class="btn btn-ghost btn-sm" on:click={handleValidate} title="Validate XML syntax">
							Validate
						</button>
					{/if}
					<button type="button" class="btn btn-ghost btn-sm" on:click={handleClearRaw} title="Clear editor content">
						Clear
					</button>
				</div>
			</div>

			<div class="textarea-wrapper" class:has-error={!!validationError}>
				<textarea
					class="code-textarea"
					bind:value={bodyData.raw}
					rows="12"
					placeholder={bodyType === 'json' ? '{\n  "employee_id": "EMP001",\n  "name": "John",\n  "department": "IT"\n}' : `Enter ${bodyType.toUpperCase()} content...`}
					spellcheck="false"
				></textarea>
			</div>

			{#if validationError}
				<div class="validation-bar">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" y1="8" x2="12" y2="12"></line>
						<line x1="12" y1="16" x2="12.01" y2="16"></line>
					</svg>
					<span>{validationError}</span>
				</div>
			{/if}
		</div>
	{:else if bodyType === 'urlencoded'}
		<div class="kv-section">
			<div class="section-actions">
				<span class="mime-hint">application/x-www-form-urlencoded</span>
				<button type="button" class="btn btn-ghost btn-sm" on:click={addUrlEncodedRow}>
					+ Add Field
				</button>
			</div>
			<div class="table-wrapper">
				<table class="kv-table">
					<thead>
						<tr>
							<th class="col-check"></th>
							<th class="col-key">Key</th>
							<th class="col-val">Value</th>
							<th class="col-action"></th>
						</tr>
					</thead>
					<tbody>
						{#each bodyData.urlencoded || [] as row, idx (row.id)}
							<tr>
								<td class="col-check">
									<label class="switch-toggle" title="Enable / Disable field">
										<input type="checkbox" bind:checked={row.enabled} />
										<span class="switch-track">
											<span class="switch-thumb"></span>
										</span>
									</label>
								</td>
								<td class="col-key">
									<input
										type="text"
										class="table-input"
										placeholder="Key"
										bind:value={row.key}
										spellcheck="false"
									/>
								</td>
								<td class="col-val">
									<input
										type="text"
										class="table-input"
										placeholder="Value"
										bind:value={row.value}
										spellcheck="false"
									/>
								</td>
								<td class="col-action">
									<button
										type="button"
										class="delete-row-btn"
										on:click={() => removeUrlEncodedRow(idx)}
									>
										&times;
									</button>
								</td>
							</tr>
						{/each}
						{#if !bodyData.urlencoded || bodyData.urlencoded.length === 0}
							<tr>
								<td colspan="4" class="empty-state">
									No fields added. <button type="button" class="link-btn" on:click={addUrlEncodedRow}>Add a field</button>.
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	{:else if bodyType === 'multipart'}
		<div class="kv-section">
			<div class="section-actions">
				<span class="mime-hint">multipart/form-data (Browser automatically sets boundary)</span>
				<button type="button" class="btn btn-ghost btn-sm" on:click={addMultipartRow}>
					+ Add Field
				</button>
			</div>
			<div class="table-wrapper">
				<table class="kv-table">
					<thead>
						<tr>
							<th class="col-check"></th>
							<th class="col-key">Key</th>
							<th class="col-type">Type</th>
							<th class="col-val">Value</th>
							<th class="col-action"></th>
						</tr>
					</thead>
					<tbody>
						{#each bodyData.multipart || [] as row, idx (row.id)}
							<tr>
								<td class="col-check">
									<label class="switch-toggle" title="Enable / Disable field">
										<input type="checkbox" bind:checked={row.enabled} />
										<span class="switch-track">
											<span class="switch-thumb"></span>
										</span>
									</label>
								</td>
								<td class="col-key">
									<input
										type="text"
										class="table-input"
										placeholder="Field name"
										bind:value={row.key}
										spellcheck="false"
									/>
								</td>
								<td class="col-type">
									<CustomSelect
										bind:value={row.type}
										options={[
											{ value: 'text', label: 'Text' },
											{ value: 'file', label: 'File' }
										]}
										size="sm"
									/>
								</td>
								<td class="col-val">
									{#if row.type === 'file'}
										<div class="custom-file-picker">
											<label class="file-select-btn">
												<input
													type="file"
													class="sr-only-file"
													on:change={(e) => handleMultipartFile(e, row)}
												/>
												<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
													<polyline points="17 8 12 3 7 8"></polyline>
													<line x1="12" y1="3" x2="12" y2="15"></line>
												</svg>
												<span>Choose File</span>
											</label>
											<span class="file-chosen-name" title={row.value || 'No file chosen'}>
												{row.value || 'No file chosen'}
											</span>
											{#if row.file}
												<button
													type="button"
													class="file-clear-btn"
													title="Remove selected file"
													on:click={() => {
														row.file = null;
														row.value = '';
														bodyData = { ...bodyData };
													}}
												>
													&times;
												</button>
											{/if}
										</div>
									{:else}
										<input
											type="text"
											class="table-input"
											placeholder="Value"
											bind:value={row.value}
										/>
									{/if}
								</td>
								<td class="col-action">
									<button
										type="button"
										class="delete-row-btn"
										on:click={() => removeMultipartRow(idx)}
									>
										&times;
									</button>
								</td>
							</tr>
						{/each}
						{#if !bodyData.multipart || bodyData.multipart.length === 0}
							<tr>
								<td colspan="5" class="empty-state">
									No form-data fields added. <button type="button" class="link-btn" on:click={addMultipartRow}>Add a field</button>.
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	{:else if bodyType === 'binary'}
		<div class="binary-section">
			<span class="mime-hint">Select a file to send as binary request body (application/octet-stream)</span>
			<div class="file-drop-card">
				{#if bodyData.binaryFile}
					<div class="selected-file-view">
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
							<polyline points="14 2 14 8 20 8"></polyline>
							<line x1="16" y1="13" x2="8" y2="13"></line>
							<line x1="16" y1="17" x2="8" y2="17"></line>
							<polyline points="10 9 9 9 8 9"></polyline>
						</svg>
						<div class="file-meta">
							<span class="file-name">{bodyData.binaryFile.name}</span>
							<span class="file-size">{formatBytes(bodyData.binaryFile.size)} · {bodyData.binaryFile.type || 'application/octet-stream'}</span>
						</div>
						<button type="button" class="btn btn-ghost btn-sm" on:click={clearBinaryFile}>
							Remove
						</button>
					</div>
				{:else}
					<label class="file-picker-label">
						<input type="file" class="hidden-file-input" on:change={handleBinaryFileSelect} />
						<div class="picker-inner">
							<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
								<polyline points="17 8 12 3 7 8"></polyline>
								<line x1="12" y1="3" x2="12" y2="15"></line>
							</svg>
							<span class="picker-title">Choose a file to send as binary body</span>
							<span class="picker-sub">Click to browse files</span>
						</div>
					</label>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.body-editor {
		display: flex;
		flex-direction: column;
		gap: 12px;
		flex: 1;
		min-height: 0;
	}
	.body-types-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		flex-shrink: 0;
	}
	.type-label {
		font-family: var(--font-display);
		font-size: 12px;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.type-pills {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-wrap: wrap;
		background: var(--bg-surface);
		padding: 3px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
	}
	.type-pill {
		padding: 4px 11px;
		font-size: 12px;
		font-family: var(--font-body);
		font-weight: 500;
		background: transparent;
		border: 1px solid transparent;
		color: var(--text-muted);
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.type-pill:hover {
		color: var(--text);
		background: var(--bg-hover);
	}
	.type-pill.active {
		background: var(--accent);
		border-color: var(--accent);
		color: #ffffff;
		font-weight: 600;
		box-shadow: 0 1px 4px var(--accent-glow);
	}
	.empty-body-notice {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 36px 16px;
		color: var(--text-muted);
		background: var(--bg-inset);
		border: 1px dashed var(--border);
		border-radius: var(--radius-sm);
		font-size: 13px;
	}
	.raw-editor-container {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--bg-inset);
		overflow: hidden;
		flex: 1;
		min-height: 200px;
	}
	.editor-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 10px;
		background: var(--bg-surface);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	.mime-hint {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--text-muted);
	}
	.toolbar-actions {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.textarea-wrapper {
		position: relative;
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
	.textarea-wrapper.has-error {
		border-bottom: 2px solid var(--danger);
	}
	.code-textarea {
		width: 100%;
		flex: 1;
		min-height: 180px;
		background: transparent;
		border: 0;
		padding: 12px;
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--text);
		line-height: 1.5;
		outline: none;
		resize: none;
	}
	.validation-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(239, 68, 68, 0.12);
		border-top: 1px solid var(--danger);
		padding: 8px 12px;
		font-size: 12px;
		color: var(--danger);
		font-family: var(--font-mono);
	}
	.kv-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.section-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.table-wrapper {
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		overflow-x: auto;
		background: var(--bg-inset);
		min-height: 80px;
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
	.col-type {
		width: 100px;
	}
	.col-val {
		width: 46%;
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
	.custom-file-picker {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		min-width: 0;
	}
	.file-select-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		font-size: 12px;
		font-weight: 500;
		color: var(--text);
		background: var(--bg-surface);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-sm);
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s ease;
		flex-shrink: 0;
	}
	.file-select-btn:hover {
		border-color: var(--accent);
		background: var(--accent-soft);
		color: var(--accent);
	}
	.sr-only-file {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}
	.file-chosen-name {
		font-family: var(--font-mono);
		font-size: 11.5px;
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}
	.file-clear-btn {
		background: transparent;
		border: 0;
		color: var(--text-faint);
		font-size: 16px;
		line-height: 1;
		cursor: pointer;
		padding: 2px 6px;
		border-radius: 4px;
		flex-shrink: 0;
	}
	.file-clear-btn:hover {
		color: var(--danger);
		background: rgba(239, 68, 68, 0.15);
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
	.binary-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.file-drop-card {
		background: var(--bg-inset);
		border: 1px dashed var(--border-strong);
		border-radius: var(--radius-md);
		padding: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.file-picker-label {
		display: block;
		cursor: pointer;
		width: 100%;
	}
	.hidden-file-input {
		display: none;
	}
	.picker-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.picker-title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 14px;
		color: var(--text);
	}
	.picker-sub {
		font-size: 12px;
		color: var(--text-muted);
	}
	.selected-file-view {
		display: flex;
		align-items: center;
		gap: 14px;
		width: 100%;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		padding: 12px 16px;
		border-radius: var(--radius-sm);
	}
	.file-meta {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.file-name {
		font-family: var(--font-mono);
		font-weight: 600;
		font-size: 13.5px;
		color: var(--text);
	}
	.file-size {
		font-size: 11.5px;
		color: var(--text-muted);
	}
</style>

