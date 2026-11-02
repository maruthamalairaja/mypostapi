<script>
	import { createEventDispatcher } from 'svelte';
	import CustomSelect from './CustomSelect.svelte';

	export let authConfig = {
		type: 'none',
		basic: { username: '', password: '' },
		bearer: { token: '', masked: true },
		apiKey: { key: 'X-API-Key', value: '', addTo: 'header' },
		customHeader: { key: '', value: '' }
	};

	const dispatch = createEventDispatcher();

	const AUTH_TYPES = [
		{ id: 'none', label: 'No Auth' },
		{ id: 'basic', label: 'Basic Auth' },
		{ id: 'bearer', label: 'Bearer Token' },
		{ id: 'apikey', label: 'API Key' },
		{ id: 'custom', label: 'Custom Header' }
	];

	function selectType(type) {
		authConfig.type = type;
		dispatchChange();
	}

	function handleInput() {
		dispatchChange();
	}

	function dispatchChange() {
		dispatch('change', authConfig);
	}
</script>

<div class="auth-editor">
	<div class="auth-types-bar">
		<span class="type-label">Type:</span>
		<div class="type-pills">
			{#each AUTH_TYPES as t}
				<button
					type="button"
					class="type-pill"
					class:active={authConfig.type === t.id}
					on:click={() => selectType(t.id)}
				>
					{t.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="auth-form-card">
		{#if authConfig.type === 'none'}
			<div class="no-auth-message">
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
					<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
				</svg>
				<span>No authentication configured for this request.</span>
			</div>
		{:else if authConfig.type === 'basic'}
			<div class="field-grid">
				<div class="form-group">
					<label class="form-label" for="basic-username">Username</label>
					<input
						id="basic-username"
						type="text"
						class="form-input"
						placeholder="Username"
						bind:value={authConfig.basic.username}
						on:input={handleInput}
						autocomplete="off"
						spellcheck="false"
					/>
				</div>
				<div class="form-group">
					<label class="form-label" for="basic-password">Password</label>
					<input
						id="basic-password"
						type="password"
						class="form-input"
						placeholder="Password"
						bind:value={authConfig.basic.password}
						on:input={handleInput}
						autocomplete="off"
					/>
				</div>
			</div>
			<div class="auth-hint">
				Encodes to <code>Authorization: Basic base64(username:password)</code> header automatically on send.
			</div>
		{:else if authConfig.type === 'bearer'}
			<div class="form-group">
				<div class="label-row">
					<label class="form-label" for="bearer-token">Token</label>
					<button
						type="button"
						class="mask-toggle-btn"
						on:click={() => {
							authConfig.bearer.masked = !authConfig.bearer.masked;
						}}
					>
						{authConfig.bearer.masked ? 'Show Token' : 'Mask Token'}
					</button>
				</div>
				{#if authConfig.bearer.masked}
					<input
						id="bearer-token"
						type="password"
						class="form-input mono"
						placeholder="Enter bearer token or JWT (e.g. eyJhbGciOi...)"
						bind:value={authConfig.bearer.token}
						on:input={handleInput}
						autocomplete="off"
					/>
				{:else}
					<input
						id="bearer-token"
						type="text"
						class="form-input mono"
						placeholder="Enter bearer token or JWT (e.g. eyJhbGciOi...)"
						bind:value={authConfig.bearer.token}
						on:input={handleInput}
						autocomplete="off"
						spellcheck="false"
					/>
				{/if}
			</div>
			<div class="auth-hint">
				Automatically sent as <code>Authorization: Bearer &lt;token&gt;</code> header.
			</div>
		{:else if authConfig.type === 'apikey'}
			<div class="field-grid triple">
				<div class="form-group">
					<label class="form-label" for="api-key-name">Key Name</label>
					<input
						id="api-key-name"
						type="text"
						class="form-input mono"
						placeholder="e.g. X-API-Key or api_key"
						bind:value={authConfig.apiKey.key}
						on:input={handleInput}
						autocomplete="off"
						spellcheck="false"
					/>
				</div>
				<div class="form-group">
					<label class="form-label" for="api-key-value">Value</label>
					<input
						id="api-key-value"
						type="password"
						class="form-input mono"
						placeholder="Key value"
						bind:value={authConfig.apiKey.value}
						on:input={handleInput}
						autocomplete="off"
					/>
				</div>
				<div class="form-group">
					<label class="form-label" for="api-key-addto">Add To</label>
					<CustomSelect
						bind:value={authConfig.apiKey.addTo}
						options={[
							{ value: 'header', label: 'Header' },
							{ value: 'query', label: 'Query Parameter' }
						]}
						size="md"
						on:change={handleInput}
					/>
				</div>
			</div>
		{:else if authConfig.type === 'custom'}
			<div class="field-grid">
				<div class="form-group">
					<label class="form-label" for="custom-header-key">Header Name</label>
					<input
						id="custom-header-key"
						type="text"
						class="form-input mono"
						placeholder="e.g. X-Custom-Auth"
						bind:value={authConfig.customHeader.key}
						on:input={handleInput}
						autocomplete="off"
						spellcheck="false"
					/>
				</div>
				<div class="form-group">
					<label class="form-label" for="custom-header-val">Header Value</label>
					<input
						id="custom-header-val"
						type="text"
						class="form-input mono"
						placeholder="Value"
						bind:value={authConfig.customHeader.value}
						on:input={handleInput}
						autocomplete="off"
						spellcheck="false"
					/>
				</div>
			</div>
		{/if}
	</div>

	<div class="security-callout">
		<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="10"></circle>
			<line x1="12" y1="16" x2="12" y2="12"></line>
			<line x1="12" y1="8" x2="12.01" y2="8"></line>
		</svg>
		<span>Credentials are strictly stored in memory for this tab session only. Refreshing or closing this page clears all entered keys and tokens.</span>
	</div>
</div>

<style>
	.auth-editor {
		display: flex;
		flex-direction: column;
		gap: 12px;
		flex: 1;
		min-height: 0;
	}
	.auth-types-bar {
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
	.auth-form-card {
		background: var(--bg-inset);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 16px;
	}
	.no-auth-message {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 24px;
		color: var(--text-muted);
		font-size: 13px;
	}
	.field-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}
	.field-grid.triple {
		grid-template-columns: 1fr 1fr 140px;
	}
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.form-label {
		font-family: var(--font-display);
		font-size: 11.5px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-muted);
	}
	.mask-toggle-btn {
		background: none;
		border: none;
		color: var(--accent);
		font-size: 11px;
		cursor: pointer;
		padding: 0;
	}
	.form-input {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 8px 10px;
		font-size: 13px;
		color: var(--text);
		outline: none;
		transition: border-color 0.15s;
	}
	.form-input:focus {
		border-color: var(--accent);
	}
	.form-input.mono {
		font-family: var(--font-mono);
	}
	.auth-hint {
		font-size: 12px;
		color: var(--text-muted);
		margin-top: 10px;
	}
	.auth-hint code {
		font-family: var(--font-mono);
		background: var(--bg-surface);
		padding: 1px 4px;
		border-radius: 3px;
		color: var(--accent-strong);
	}
	.security-callout {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--accent-soft);
		border: 1px solid var(--border-strong);
		padding: 8px 12px;
		border-radius: var(--radius-sm);
		font-size: 11.5px;
		color: var(--text-muted);
		line-height: 1.4;
	}
	@media (max-width: 640px) {
		.field-grid,
		.field-grid.triple {
			grid-template-columns: 1fr;
		}
	}
</style>
