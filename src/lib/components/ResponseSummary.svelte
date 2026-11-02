<script>
	import { formatBytes, formatDuration } from '$lib/utils/formatters.js';

	export let response = null;

	$: status = response?.status || 0;
	$: isSuccess = status >= 200 && status < 300;
	$: isRedirect = status >= 300 && status < 400;
	$: isClientError = status >= 400 && status < 500;
	$: isServerError = status >= 500 && status < 600;
	$: isNetworkError = !response?.success && status === 0;

	$: statusClass = isSuccess
		? 'status-2xx'
		: isRedirect
		? 'status-3xx'
		: isClientError
		? 'status-4xx'
		: isServerError
		? 'status-5xx'
		: 'status-err';
</script>

<div class="response-summary">
	<div class="summary-left">
		<div class="status-badge {statusClass}">
			<span class="status-code">{status > 0 ? status : 'ERR'}</span>
			<span class="status-text">{response.statusText || 'Error'}</span>
		</div>

		<div class="meta-pill" title="Round-trip execution duration">
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"></circle>
				<polyline points="12 6 12 12 16 14"></polyline>
			</svg>
			<span>{formatDuration(response.responseTimeMs)}</span>
		</div>

		{#if response.sizeBytes !== undefined}
			<div class="meta-pill" title="Total response payload size (Headers + Body)">
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="7 10 12 15 17 10"></polyline>
					<line x1="12" y1="15" x2="12" y2="3"></line>
				</svg>
				<span>{formatBytes(response.sizeBytes)}</span>
			</div>
		{/if}
	</div>

	<div class="summary-right">
		{#if response.contentType}
			<span class="content-type-badge" title="Content-Type header">
				{response.contentType.split(';')[0]}
			</span>
		{/if}
		<span class="timestamp" title="Execution timestamp">
			{new Date(response.timestamp).toLocaleTimeString()}
		</span>
	</div>
</div>

<style>
	.response-summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		padding: 10px 14px;
		background: var(--bg-surface);
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
	}
	.summary-left {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 700;
	}
	.status-2xx {
		background: rgba(16, 185, 129, 0.15);
		color: var(--success);
		border: 1px solid rgba(16, 185, 129, 0.35);
	}
	.status-3xx {
		background: rgba(6, 182, 212, 0.15);
		color: var(--info);
		border: 1px solid rgba(6, 182, 212, 0.35);
	}
	.status-4xx {
		background: rgba(245, 158, 11, 0.15);
		color: var(--warning);
		border: 1px solid rgba(245, 158, 11, 0.35);
	}
	.status-5xx {
		background: rgba(239, 68, 68, 0.15);
		color: var(--danger);
		border: 1px solid rgba(239, 68, 68, 0.35);
	}
	.status-err {
		background: rgba(239, 68, 68, 0.15);
		color: var(--danger);
		border: 1px solid rgba(239, 68, 68, 0.35);
	}
	.status-code {
		font-weight: 800;
	}
	.status-text {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 12.5px;
	}
	.meta-pill {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--text-muted);
		background: var(--bg-inset);
		border: 1px solid var(--border);
		padding: 4px 9px;
		border-radius: var(--radius-sm);
	}
	.summary-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.content-type-badge {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--text-faint);
		background: var(--bg-inset);
		padding: 3px 8px;
		border-radius: 4px;
		border: 1px solid var(--border);
	}
	.timestamp {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--text-faint);
	}
</style>

