<script>
	import RequestBuilder from '$lib/components/RequestBuilder.svelte';
	import ResponseViewer from '$lib/components/ResponseViewer.svelte';
	import { executeApiRequest } from '$lib/utils/apiClient.js';
	import { toast } from '$lib/stores/toast.js';
	import { uid } from '$lib/utils/requestBuilder.js';
	import { layoutStore } from '$lib/stores/layout.js';

	// In-memory request state (NO storage, strictly cleared on reload)
	let method = 'GET';
	let url = '';
	let params = [];
	let headers = [
		{
			id: uid(),
			enabled: true,
			key: 'Accept',
			value: 'application/json, text/plain, */*',
			description: 'Default accept header'
		}
	];
	let bodyType = 'none';
	let bodyData = {
		raw: '',
		urlencoded: [],
		multipart: [],
		binaryFile: null
	};
	let authConfig = {
		type: 'none',
		basic: { username: '', password: '' },
		bearer: { token: '', masked: true },
		apiKey: { key: 'X-API-Key', value: '', addTo: 'header' },
		customHeader: { key: '', value: '' }
	};
	let timeoutMs = 30000;

	// Response state
	let loading = false;
	let response = null;
	let abortController = null;

	async function handleSend() {
		if (loading) return;
		loading = true;
		abortController = new AbortController();

		try {
			const res = await executeApiRequest({
				method,
				url,
				params,
				headers,
				bodyType,
				bodyData,
				authConfig,
				timeoutMs,
				externalSignal: abortController.signal
			});

			response = res;

			if (res.success) {
				if (res.ok) {
					toast(`${method} ${res.status} ${res.statusText}`, 'success', 2500);
				} else {
					toast(`${method} ${res.status} ${res.statusText}`, 'warning', 3500);
				}
			} else if (res.errorType === 'CANCELLED') {
				toast('Request cancelled', 'info', 2000);
			} else if (res.errorType === 'TIMEOUT') {
				toast(res.message, 'error', 3500);
			} else {
				toast(res.message || 'Request failed', 'error', 4000);
			}
		} catch (e) {
			toast(e.message || 'An unexpected error occurred', 'error', 3500);
		} finally {
			loading = false;
			abortController = null;
		}
	}

	function handleCancel() {
		if (abortController) {
			abortController.abort();
		}
	}

	function handleClearResponse() {
		response = null;
		toast('Response cleared', 'info', 1500);
	}

	function handleResetAll() {
		method = 'GET';
		url = '';
		params = [];
		headers = [
			{
				id: uid(),
				enabled: true,
				key: 'Accept',
				value: 'application/json, text/plain, */*',
				description: ''
			}
		];
		bodyType = 'none';
		bodyData = {
			raw: '',
			urlencoded: [],
			multipart: [],
			binaryFile: null
		};
		authConfig = {
			type: 'none',
			basic: { username: '', password: '' },
			bearer: { token: '', masked: true },
			apiKey: { key: 'X-API-Key', value: '', addTo: 'header' },
			customHeader: { key: '', value: '' }
		};
		response = null;
		toast('All request and response data cleared', 'info', 2500);
	}
</script>

<svelte:window on:resetAll={handleResetAll} />

<div class="workspace-container" class:row-view={$layoutStore === 'row'}>
	<div class="workspace-grid" class:layout-row={$layoutStore === 'row'} class:layout-column={$layoutStore === 'column'}>
		<div class="grid-pane builder-pane">
			<!-- Request Builder Section -->
			<RequestBuilder
				bind:method
				bind:url
				bind:params
				bind:headers
				bind:bodyType
				bind:bodyData
				bind:authConfig
				bind:timeoutMs
				{loading}
				on:send={handleSend}
				on:cancel={handleCancel}
			/>
		</div>

		<div class="grid-pane viewer-pane">
			<!-- Response Viewer Section -->
			<ResponseViewer
				{response}
				{loading}
				on:clear={handleClearResponse}
			/>
		</div>
	</div>
</div>

<style>
	.workspace-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.workspace-grid {
		display: flex;
		flex-direction: column;
		gap: 22px;
		width: 100%;
		transition: all 0.2s ease;
	}
	.workspace-grid.layout-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		align-items: stretch;
		gap: 20px;
	}
	.grid-pane {
		min-width: 0;
		width: 100%;
	}
	@media (min-width: 1024px) {
		.workspace-container.row-view {
			flex: 1;
			min-height: 0;
			height: 100%;
		}
		.workspace-grid.layout-row {
			flex: 1;
			min-height: 0;
			height: 100%;
		}
		.workspace-grid.layout-row .grid-pane {
			height: 100%;
			min-height: 0;
			display: flex;
			flex-direction: column;
		}
	}
	@media (max-width: 1023px) {
		.workspace-grid.layout-row {
			grid-template-columns: 1fr;
		}
	}
</style>

