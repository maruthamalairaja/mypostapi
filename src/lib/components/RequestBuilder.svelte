<script>
	import { createEventDispatcher } from 'svelte';
	import UrlBar from './UrlBar.svelte';
	import ParamsEditor from './ParamsEditor.svelte';
	import HeadersEditor from './HeadersEditor.svelte';
	import BodyEditor from './BodyEditor.svelte';
	import AuthorizationEditor from './AuthorizationEditor.svelte';
	import CustomSelect from './CustomSelect.svelte';
	import {
		splitBaseAndQuery,
		parseQueryParamsFromUrl,
		buildResolvedUrl,
		uid
	} from '$lib/utils/requestBuilder.js';
	import { BODY_TYPES } from '$lib/utils/constants.js';

	export let method = 'GET';
	export let url = '';
	export let params = [];
	export let headers = [];
	export let bodyType = 'none';
	export let bodyData = {
		raw: '',
		urlencoded: [],
		multipart: [],
		binaryFile: null
	};
	export let authConfig = {
		type: 'none',
		basic: { username: '', password: '' },
		bearer: { token: '', masked: true },
		apiKey: { key: 'X-API-Key', value: '', addTo: 'header' },
		customHeader: { key: '', value: '' }
	};
	export let loading = false;
	export let timeoutMs = 30000;

	const dispatch = createEventDispatcher();
	let activeTab = 'params'; // 'params' | 'headers' | 'body' | 'auth'
	let isBodyValid = true;
	let prevBodyType = bodyType;

	$: resolvedUrl = buildResolvedUrl(url, params, authConfig);

	// Synchronize URL query changes to params
	function handleUrlChange(newUrl) {
		url = newUrl;
		const parsed = parseQueryParamsFromUrl(newUrl);
		if (parsed.length > 0) {
			params = parsed;
		}
	}

	// Synchronize Params changes to URL bar
	function handleParamsChange(newParams) {
		params = newParams;
		const { baseUrl } = splitBaseAndQuery(url);
		url = buildResolvedUrl(baseUrl, params);
	}

	// Handle body type change & intelligent Content-Type management
	function handleBodyTypeChange(newType) {
		bodyType = newType;
		const typeDef = BODY_TYPES.find((b) => b.id === newType);
		const expectedContentType = typeDef?.contentType;

		// Find existing content-type header
		const ctIndex = headers.findIndex((h) => h.key.toLowerCase() === 'content-type');

		if (expectedContentType) {
			if (ctIndex !== -1) {
				// Update existing Content-Type header
				headers[ctIndex].value = expectedContentType;
				headers[ctIndex].enabled = true;
				headers = [...headers];
			} else {
				// Add Content-Type header
				headers = [
					...headers,
					{
						id: uid(),
						enabled: true,
						key: 'Content-Type',
						value: expectedContentType,
						description: 'Auto-set by body format'
					}
				];
			}
		} else if (newType === 'none' || newType === 'multipart') {
			// If multipart or none, disable or remove auto Content-Type
			if (ctIndex !== -1 && headers[ctIndex].description === 'Auto-set by body format') {
				headers = headers.filter((_, i) => i !== ctIndex);
			}
		}

		prevBodyType = newType;
	}

	function handleSampleLoaded(sample) {
		if (sample.method === 'POST') {
			bodyType = 'json';
			bodyData.raw = JSON.stringify(
				{
					title: 'Sample Request',
					body: 'Created using SAM API Client',
					userId: 1
				},
				null,
				2
			);
			handleBodyTypeChange('json');
		} else {
			bodyType = 'none';
			handleBodyTypeChange('none');
		}
	}

	function handleSend() {
		if (!isBodyValid) return;
		dispatch('send');
	}
</script>

<section class="request-builder card">
	<div class="card-inner">
		<!-- Top URL Bar -->
		<UrlBar
			bind:method
			bind:url
			{loading}
			{timeoutMs}
			on:urlChange={(e) => handleUrlChange(e.detail)}
			on:methodChange={(e) => (method = e.detail)}
			on:sampleLoaded={(e) => handleSampleLoaded(e.detail)}
			on:send={handleSend}
			on:cancel={() => dispatch('cancel')}
		/>

		<!-- Tabs Bar -->
		<div class="tabs-header">
			<div class="tabs-nav" role="tablist">
				<button
					type="button"
					role="tab"
					class="tab-btn"
					class:active={activeTab === 'params'}
					aria-selected={activeTab === 'params'}
					on:click={() => (activeTab = 'params')}
				>
					<span>Params</span>
					{#if params.filter((p) => p.enabled && p.key).length > 0}
						<span class="tab-badge">{params.filter((p) => p.enabled && p.key).length}</span>
					{/if}
				</button>

				<button
					type="button"
					role="tab"
					class="tab-btn"
					class:active={activeTab === 'headers'}
					aria-selected={activeTab === 'headers'}
					on:click={() => (activeTab = 'headers')}
				>
					<span>Headers</span>
					{#if headers.filter((h) => h.enabled && h.key).length > 0}
						<span class="tab-badge">{headers.filter((h) => h.enabled && h.key).length}</span>
					{/if}
				</button>

				<button
					type="button"
					role="tab"
					class="tab-btn"
					class:active={activeTab === 'body'}
					aria-selected={activeTab === 'body'}
					on:click={() => (activeTab = 'body')}
				>
					<span>Body</span>
					{#if bodyType !== 'none'}
						<span class="tab-badge active-type">{bodyType}</span>
					{/if}
				</button>

				<button
					type="button"
					role="tab"
					class="tab-btn"
					class:active={activeTab === 'auth'}
					aria-selected={activeTab === 'auth'}
					on:click={() => (activeTab = 'auth')}
				>
					<span>Authorization</span>
					{#if authConfig.type !== 'none'}
						<span class="tab-badge active-auth">{authConfig.type}</span>
					{/if}
				</button>
			</div>

			<div class="tab-info">
				<div class="timeout-selector">
					<span class="timeout-label">Timeout:</span>
					<CustomSelect
						bind:value={timeoutMs}
						options={[
							{ value: 5000, label: '5s' },
							{ value: 10000, label: '10s' },
							{ value: 30000, label: '30s' },
							{ value: 60000, label: '60s' },
							{ value: 0, label: 'None' }
						]}
						size="sm"
						ariaLabel="Request timeout"
					/>
				</div>
			</div>
		</div>

		<!-- Tab Content Area -->
		<div class="tab-content">
			{#if activeTab === 'params'}
				<ParamsEditor
					bind:params
					{resolvedUrl}
					on:change={(e) => handleParamsChange(e.detail)}
				/>
			{:else if activeTab === 'headers'}
				<HeadersEditor
					bind:headers
					on:change={(e) => (headers = e.detail)}
				/>
			{:else if activeTab === 'body'}
				<BodyEditor
					bind:bodyType
					bind:bodyData
					bind:isBodyValid
					on:typeChange={(e) => handleBodyTypeChange(e.detail)}
					on:validityChange={(e) => (isBodyValid = e.detail)}
				/>
			{:else if activeTab === 'auth'}
				<AuthorizationEditor
					bind:authConfig
					on:change={(e) => (authConfig = e.detail)}
				/>
			{/if}
		</div>
	</div>
</section>

<style>
	.request-builder {
		width: 100%;
		height: 100%;
		min-height: 0;
		display: flex;
		flex-direction: column;
		border-radius: var(--radius-lg);
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		box-shadow: var(--card-shadow);
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		overflow: hidden;
	}
	.card-inner {
		padding: clamp(14px, 2vw, 20px);
		display: flex;
		flex-direction: column;
		gap: 14px;
		height: 100%;
		min-height: 0;
		flex: 1;
		overflow: hidden;
	}
	.tabs-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--border);
		padding-bottom: 0;
		gap: 10px;
		flex-wrap: wrap;
		flex-shrink: 0;
	}
	.tabs-nav {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.tab-btn {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		background: transparent;
		border: 0;
		border-bottom: 2px solid transparent;
		padding: 9px 16px;
		font-family: var(--font-display);
		font-size: 13px;
		font-weight: 600;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.15s ease;
		margin-bottom: -1px;
		border-radius: var(--radius-sm) var(--radius-sm) 0 0;
	}
	.tab-btn:hover {
		color: var(--text);
		background: var(--accent-soft);
	}
	.tab-btn.active {
		color: var(--accent);
		border-bottom-color: var(--accent);
		background: var(--accent-soft);
	}
	.tab-badge {
		font-size: 10px;
		font-family: var(--font-mono);
		font-weight: 600;
		background: var(--bg-surface);
		color: var(--text-muted);
		padding: 1px 6px;
		border-radius: 999px;
		border: 1px solid var(--border);
		transition: all 0.15s ease;
	}
	.tab-btn.active .tab-badge,
	.tab-badge.active-type,
	.tab-badge.active-auth {
		background: var(--accent);
		color: #ffffff;
		border-color: var(--accent);
		text-transform: uppercase;
		box-shadow: 0 1px 4px var(--accent-glow);
	}
	.tab-info {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.timeout-selector {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.timeout-label {
		font-size: 11.5px;
		color: var(--text-faint);
		font-family: var(--font-display);
	}
	.tab-content {
		padding-top: 4px;
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		display: flex;
		flex-direction: column;
	}
</style>
