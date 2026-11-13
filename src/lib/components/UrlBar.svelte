<script>
	import { createEventDispatcher } from 'svelte';
	import MethodSelector from './MethodSelector.svelte';
	import { validateUrl } from '$lib/utils/validators.js';

	export let method = 'GET';
	export let url = '';
	export let loading = false;

	const dispatch = createEventDispatcher();
	let validation = { valid: true };
	let showSamples = false;

	const SAMPLES = [
		{ label: 'JSONPlaceholder GET Post', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/1' },
		{ label: 'JSONPlaceholder POST Post', method: 'POST', url: 'https://jsonplaceholder.typicode.com/posts' },
		{ label: 'HTTPBin GET with Params', method: 'GET', url: 'https://httpbin.org/get?user=marut&role=developer' },
		{ label: 'HTTPBin POST JSON', method: 'POST', url: 'https://httpbin.org/post' },
		{ label: 'HTTPBin Status 404 Client Error', method: 'GET', url: 'https://httpbin.org/status/404' },
		{ label: 'HTTPBin Status 500 Server Error', method: 'GET', url: 'https://httpbin.org/status/500' }
	];

	function handleInput(e) {
		url = e.target.value;
		validate();
		dispatch('urlChange', url);
	}

	function validate() {
		if (!url) {
			validation = { valid: true };
			return true;
		}
		validation = validateUrl(url);
		return validation.valid;
	}

	function handleSend() {
		if (loading) return;
		if (!url || !url.trim()) {
			validation = { valid: false, error: 'Please enter an API URL' };
			return;
		}
		if (!validate()) return;
		dispatch('send');
	}

	function handleCancel() {
		dispatch('cancel');
	}

	function handleClear() {
		url = '';
		validation = { valid: true };
		dispatch('urlChange', '');
	}

	function handleKeydown(e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSend();
		}
	}

	function loadSample(sample) {
		method = sample.method;
		url = sample.url;
		showSamples = false;
		dispatch('methodChange', method);
		dispatch('urlChange', url);
		dispatch('sampleLoaded', sample);
	}
</script>

<div class="url-bar-wrapper">
	<div class="url-bar-container" class:has-error={!validation.valid}>
		<MethodSelector
			bind:value={method}
			on:change={(e) => dispatch('methodChange', e.detail.value)}
		/>

		<div class="input-inner">
			<input
				type="url"
				class="url-input"
				placeholder="Enter request URL (e.g. https://jsonplaceholder.typicode.com/posts)..."
				value={url}
				on:input={handleInput}
				on:keydown={handleKeydown}
				aria-label="Request URL"
				spellcheck="false"
			/>
			{#if url}
				<button
					type="button"
					class="clear-url-btn"
					on:click={handleClear}
					title="Clear URL"
					aria-label="Clear URL"
				>
					&times;
				</button>
			{/if}
		</div>

		<div class="actions">
			<!-- <div class="samples-wrapper">
				<button
					type="button"
					class="btn btn-ghost btn-sm sample-toggle"
					on:click={() => (showSamples = !showSamples)}
					title="Load quick test API endpoint"
				>
					<span>Samples</span>
					<svg width="10" height="6" viewBox="0 0 10 6" fill="none">
						<path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
				{#if showSamples}
					<ul class="samples-menu">
						{#each SAMPLES as s}
							<li>
								<button type="button" class="sample-item" on:click={() => loadSample(s)}>
									<span class="sample-method" data-method={s.method}>{s.method}</span>
									<span class="sample-label">{s.label}</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div> -->

			{#if loading}
				<button
					type="button"
					class="btn btn-danger send-btn"
					on:click={handleCancel}
					title="Cancel active request"
				>
					<span class="spinner" aria-hidden="true"></span>
					<span>Cancel</span>
				</button>
			{:else}
				<button
					type="button"
					class="btn btn-primary send-btn"
					on:click={handleSend}
					disabled={loading}
					title="Send request (Enter)"
				>
					<span>Send</span>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<line x1="22" y1="2" x2="11" y2="13"></line>
						<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
					</svg>
				</button>
			{/if}
		</div>
	</div>

	{#if !validation.valid && validation.error}
		<div class="validation-error">
			<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
			<span>{validation.error}</span>
		</div>
	{/if}
</div>

<style>
	.url-bar-wrapper {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
	}
	.url-bar-container {
		display: flex;
		align-items: stretch;
		width: 100%;
		background: var(--bg-inset);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-md);
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.url-bar-container:focus-within {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.url-bar-container.has-error {
		border-color: var(--danger);
	}
	.input-inner {
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
		min-width: 0;
	}
	.url-input {
		width: 100%;
		height: 42px;
		background: transparent;
		border: 0;
		padding: 0 32px 0 14px;
		font-family: var(--font-mono);
		font-size: 13.5px;
		color: var(--text);
		outline: none;
	}
	.url-input::placeholder {
		color: var(--text-faint);
		font-family: var(--font-body);
		font-size: 13px;
	}
	.clear-url-btn {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		background: transparent;
		border: 0;
		color: var(--text-faint);
		font-size: 18px;
		cursor: pointer;
		padding: 0 6px;
		line-height: 1;
	}
	.clear-url-btn:hover {
		color: var(--text);
	}
	.actions {
		display: flex;
		align-items: center;
		padding: 3px 4px;
		gap: 6px;
		position: relative;
	}
	.send-btn {
		height: 36px;
		padding: 0 18px;
		font-size: 13.5px;
	}
	.send-btn.btn-primary {
		background: linear-gradient(135deg, var(--accent), var(--accent-strong)) !important;
		color: #ffffff !important;
		border-color: transparent !important;
	}
	.send-btn.btn-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, var(--accent-hover), var(--accent)) !important;
		color: #ffffff !important;
		border-color: transparent !important;
		box-shadow: 0 6px 20px var(--accent-glow);
	}
	.send-btn.btn-primary:active:not(:disabled) {
		background: var(--accent-strong) !important;
		color: #ffffff !important;
	}
	.samples-wrapper {
		position: relative;
	}
	.sample-toggle {
		height: 36px;
		gap: 5px;
		font-family: var(--font-display);
		font-size: 12px;
	}
	.samples-menu {
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		z-index: 100;
		background: var(--bg-elevated);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-sm);
		box-shadow: var(--card-shadow-hover);
		padding: 6px;
		list-style: none;
		margin: 0;
		width: 310px;
	}
	.sample-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 8px 10px;
		border: 0;
		border-radius: 4px;
		background: transparent;
		color: var(--text);
		cursor: pointer;
		font-size: 12px;
		text-align: left;
		transition: background 0.12s;
	}
	.sample-item:hover {
		background: var(--accent-soft);
	}
	.sample-method {
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: 10.5px;
		padding: 2px 6px;
		border-radius: 3px;
		background: var(--bg-inset);
	}
	.sample-method[data-method='GET'] {
		color: var(--method-get);
	}
	.sample-method[data-method='POST'] {
		color: var(--method-post);
	}
	.sample-label {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: #ffffff;
		animation: spin 0.7s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.validation-error {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: var(--danger);
		padding-left: 6px;
	}
	@media (max-width: 680px) {
		.url-bar-container {
			flex-wrap: wrap;
		}
		.input-inner {
			width: 100%;
			order: 2;
			border-top: 1px solid var(--border);
		}
		.actions {
			order: 1;
			margin-left: auto;
		}
	}
</style>
