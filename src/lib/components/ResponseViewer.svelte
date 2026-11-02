<script>
	import { createEventDispatcher } from 'svelte';
	import ResponseSummary from './ResponseSummary.svelte';
	import ResponsePretty from './ResponsePretty.svelte';
	import ResponseRaw from './ResponseRaw.svelte';
	import ResponsePreview from './ResponsePreview.svelte';
	import ResponseHeaders from './ResponseHeaders.svelte';
	import { toast } from '$lib/stores/toast.js';

	export let response = null;
	export let loading = false;

	const dispatch = createEventDispatcher();
	let activeTab = 'pretty'; // 'pretty' | 'raw' | 'preview' | 'headers'

	let lastHandledResponse = null;

	// When a file is returned, automatically make Preview the default tab (Only for files)
	$: if (response && response !== lastHandledResponse) {
		lastHandledResponse = response;
		if (response.isFile) {
			activeTab = 'preview';
		} else {
			if (activeTab === 'preview') {
				activeTab = response.isJson ? 'pretty' : 'raw';
			}
		}
	} else if (!response) {
		lastHandledResponse = null;
	}

	async function copyResponseBody() {
		if (!response?.rawText) return;
		try {
			await navigator.clipboard.writeText(response.rawText);
			toast('Response body copied to clipboard', 'success', 2000);
		} catch (e) {
			toast('Failed to copy', 'error', 2000);
		}
	}

	function downloadResponse() {
		if (!response) return;
		try {
			let blobToDownload = response.blob;
			let filename = 'response';

			if (response.isJson) {
				filename += '.json';
				if (!blobToDownload) {
					blobToDownload = new Blob([response.rawText], { type: 'application/json' });
				}
			} else if (response.isHtml) {
				filename += '.html';
				if (!blobToDownload) {
					blobToDownload = new Blob([response.rawText], { type: 'text/html' });
				}
			} else if (response.isXml) {
				filename += '.xml';
				if (!blobToDownload) {
					blobToDownload = new Blob([response.rawText], { type: 'application/xml' });
				}
			} else if (response.isImage) {
				const ext = response.contentType?.split('/')[1]?.split(';')[0] || 'png';
				filename += `.${ext}`;
			} else {
				filename += '.txt';
				if (!blobToDownload) {
					blobToDownload = new Blob([response.rawText], { type: 'text/plain' });
				}
			}

			const url = URL.createObjectURL(blobToDownload);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast(`Downloaded as ${filename}`, 'success', 2500);
		} catch (e) {
			toast(`Download failed: ${e.message}`, 'error', 3000);
		}
	}

	function handleClear() {
		dispatch('clear');
	}
</script>

<section class="response-viewer card">
	<div class="card-inner">
		<!-- Section Header & Actions -->
		<div class="response-header">
			<div class="header-left">
				<span class="response-title">Response</span>
				{#if response && response.status > 0}
					<span class="status-indicator-dot" class:success={response.ok} class:error={!response.ok}></span>
				{/if}
			</div>

			{#if response}
				<div class="response-actions">
					<button
						type="button"
						class="btn btn-ghost btn-sm"
						on:click={copyResponseBody}
						title="Copy response body"
						disabled={!response.rawText}
					>
						<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
						</svg>
						<span>Copy</span>
					</button>

					<button
						type="button"
						class="btn btn-ghost btn-sm"
						on:click={downloadResponse}
						title="Download response payload"
					>
						<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
							<polyline points="7 10 12 15 17 10"></polyline>
							<line x1="12" y1="15" x2="12" y2="3"></line>
						</svg>
						<span>Download</span>
					</button>

					<button
						type="button"
						class="btn btn-ghost btn-sm"
						on:click={handleClear}
						title="Clear response view"
					>
						Clear
					</button>
				</div>
			{/if}
		</div>

		{#if loading}
			<!-- Loading state -->
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<span class="loading-title">Sending HTTP request...</span>
				<span class="loading-sub">Waiting for response from target server</span>
			</div>
		{:else if response}
			<!-- Network / CORS / Timeout Error Banner -->
			{#if !response.success && response.status === 0}
				<div class="network-error-card">
					<div class="error-head">
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="10"></circle>
							<line x1="12" y1="8" x2="12" y2="12"></line>
							<line x1="12" y1="16" x2="12.01" y2="16"></line>
						</svg>
						<div class="error-title-group">
							<span class="error-title">{response.statusText || 'Request Failed'}</span>
							<span class="error-msg">{response.message}</span>
						</div>
					</div>

					{#if response.corsExplanation}
						<div class="cors-details">
							<div class="cors-title">Browser Request Diagnostics & CORS Notice:</div>
							<p class="cors-body">{response.corsExplanation}</p>
							<ul class="cors-tips">
								<li>Ensure the target API allows Cross-Origin Resource Sharing (<code>Access-Control-Allow-Origin: *</code>).</li>
								<li>Verify that the server URL is online and reachable from your computer.</li>
								<li>For local development (e.g. <code>http://localhost:3000</code>), ensure your backend includes CORS headers.</li>
							</ul>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Summary Bar -->
				<ResponseSummary {response} />

				<!-- Response Navigation Tabs -->
				<div class="response-tabs-bar">
					<div class="resp-nav" role="tablist">
						<button
							type="button"
							role="tab"
							class="resp-tab-btn"
							class:active={activeTab === 'pretty'}
							on:click={() => (activeTab = 'pretty')}
						>
							Pretty
						</button>
						<button
							type="button"
							role="tab"
							class="resp-tab-btn"
							class:active={activeTab === 'raw'}
							on:click={() => (activeTab = 'raw')}
						>
							Raw
						</button>
						<button
							type="button"
							role="tab"
							class="resp-tab-btn"
							class:active={activeTab === 'preview'}
							on:click={() => (activeTab = 'preview')}
						>
							Preview
							{#if response?.isFile}
								<span class="file-badge">File</span>
							{/if}
						</button>
						<button
							type="button"
							role="tab"
							class="resp-tab-btn"
							class:active={activeTab === 'headers'}
							on:click={() => (activeTab = 'headers')}
						>
							Headers
							{#if response.headers?.length}
								<span class="headers-count">{response.headers.length}</span>
							{/if}
						</button>
					</div>
				</div>

				<!-- Response Body View -->
				<div class="response-tab-content">
					{#if activeTab === 'pretty'}
						<ResponsePretty {response} />
					{:else if activeTab === 'raw'}
						<ResponseRaw {response} />
					{:else if activeTab === 'preview'}
						<ResponsePreview {response} />
					{:else if activeTab === 'headers'}
						<ResponseHeaders headers={response.headers || []} />
					{/if}
				</div>
			{/if}
		{:else}
			<!-- Empty State -->
			<div class="empty-state-card">
				<div class="empty-glyph">
					<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
						<path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
					</svg>
				</div>
				<span class="empty-title">Ready to Test APIs</span>
				<span class="empty-sub">Enter an API endpoint above and click Send to inspect status, headers, and responses in real time.</span>
			</div>
		{/if}
	</div>
</section>

<style>
	.response-viewer {
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
	.response-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 2px;
		border-bottom: 1px solid var(--border);
		gap: 12px;
		flex-shrink: 0;
	}
	.header-left {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.response-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 15px;
		color: var(--text);
		letter-spacing: -0.01em;
	}
	.status-indicator-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--text-faint);
	}
	.status-indicator-dot.success {
		background: var(--success);
		box-shadow: 0 0 8px rgba(63, 206, 160, 0.4);
	}
	.status-indicator-dot.error {
		background: var(--danger);
		box-shadow: 0 0 8px rgba(255, 107, 107, 0.4);
	}
	.response-actions {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 16px;
		gap: 10px;
	}
	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--border-strong);
		border-radius: 50%;
		border-top-color: var(--accent);
		animation: spin 0.8s linear infinite;
	}
	.loading-title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 14px;
		color: var(--text);
	}
	.loading-sub {
		font-size: 12px;
		color: var(--text-muted);
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.network-error-card {
		background: rgba(239, 68, 68, 0.08);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: var(--radius-sm);
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.error-head {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}
	.error-title-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.error-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 14.5px;
		color: var(--danger);
	}
	.error-msg {
		font-family: var(--font-mono);
		font-size: 12.5px;
		color: var(--text);
	}
	.cors-details {
		background: var(--bg-inset);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 12px;
		font-size: 12px;
		color: var(--text-muted);
		line-height: 1.5;
	}
	.cors-title {
		font-family: var(--font-display);
		font-weight: 600;
		color: var(--text);
		margin-bottom: 4px;
	}
	.cors-body {
		margin: 0 0 8px;
	}
	.cors-tips {
		margin: 0;
		padding-left: 20px;
	}
	.cors-tips li {
		margin-bottom: 4px;
	}
	.cors-tips code {
		font-family: var(--font-mono);
		background: var(--bg-surface);
		padding: 1px 4px;
		border-radius: 3px;
		color: var(--accent);
	}
	.response-tabs-bar {
		border-bottom: 1px solid var(--border);
		padding-bottom: 0;
		flex-shrink: 0;
	}
	.resp-nav {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.resp-tab-btn {
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
	.resp-tab-btn:hover {
		color: var(--text);
		background: var(--accent-soft);
	}
	.resp-tab-btn.active {
		color: var(--accent);
		border-bottom-color: var(--accent);
		background: var(--accent-soft);
	}
	.headers-count {
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
	.resp-tab-btn.active .headers-count {
		background: var(--accent);
		color: #ffffff;
		border-color: var(--accent);
		box-shadow: 0 1px 4px var(--accent-glow);
	}
	.file-badge {
		font-size: 9.5px;
		font-family: var(--font-mono);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: var(--accent-soft);
		color: var(--accent);
		border: 1px solid var(--accent);
		padding: 1px 5px;
		border-radius: 999px;
	}
	.resp-tab-btn.active .file-badge {
		background: var(--accent);
		color: #ffffff;
		border-color: var(--accent);
		box-shadow: 0 1px 4px var(--accent-glow);
	}
	.response-tab-content {
		padding-top: 4px;
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		display: flex;
		flex-direction: column;
	}
	.empty-state-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 36px 24px;
		text-align: center;
		gap: 8px;
		background: var(--bg-inset);
		border: 1px dashed var(--border);
		border-radius: var(--radius-sm);
		flex: 1;
		min-height: 240px;
	}
	.empty-glyph {
		margin-bottom: 4px;
		opacity: 0.9;
	}
	.empty-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 15px;
		color: var(--text);
	}
	.empty-sub {
		font-size: 12.5px;
		color: var(--text-muted);
		max-width: 440px;
		line-height: 1.45;
	}
</style>
