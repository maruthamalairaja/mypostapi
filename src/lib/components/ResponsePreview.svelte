<script>
	import { formatBytes } from '$lib/utils/formatters.js';

	export let response;

	$: isImage = response?.isImage || response?.contentType?.toLowerCase().startsWith('image/');
	$: isPdf = response?.isPdf || response?.contentType?.toLowerCase().includes('application/pdf');
	$: isAudio = response?.isAudio || response?.contentType?.toLowerCase().startsWith('audio/');
	$: isVideo = response?.isVideo || response?.contentType?.toLowerCase().startsWith('video/');
	$: isHtml = response?.isHtml || response?.contentType?.toLowerCase().includes('html');
	$: isFile = response?.isFile || isImage || isPdf || isAudio || isVideo;
	$: displayFileName = response?.fileName || (isImage ? 'image' : isPdf ? 'document.pdf' : 'response_file');

	function handleDownload() {
		if (!response) return;
		let blob = response.blob;
		if (!blob && response.rawText) {
			blob = new Blob([response.rawText], { type: response.contentType || 'application/octet-stream' });
		}
		if (!blob) return;

		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = displayFileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<div class="preview-viewer">
	{#if isImage && response?.blobUrl}
		<div class="image-preview-card">
			<div class="image-wrapper">
				<img src={response.blobUrl} alt="Response preview" class="preview-img" />
			</div>
			<div class="preview-meta-bar">
				<div class="meta-left">
					<span class="file-tag">Image File</span>
					<span class="file-detail">{response.contentType}</span>
					<span class="file-size">{formatBytes(response.bodySizeBytes || 0)}</span>
				</div>
				<button type="button" class="btn btn-sm btn-ghost download-btn" on:click={handleDownload}>
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
						<polyline points="7 10 12 15 17 10"></polyline>
						<line x1="12" y1="15" x2="12" y2="3"></line>
					</svg>
					<span>Download</span>
				</button>
			</div>
		</div>
	{:else if isPdf && response?.blobUrl}
		<div class="pdf-container">
			<div class="preview-meta-bar">
				<div class="meta-left">
					<span class="file-tag">PDF Document</span>
					<span class="file-detail">{displayFileName}</span>
					<span class="file-size">{formatBytes(response.bodySizeBytes || 0)}</span>
				</div>
				<button type="button" class="btn btn-sm btn-primary download-btn" on:click={handleDownload}>
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
						<polyline points="7 10 12 15 17 10"></polyline>
						<line x1="12" y1="15" x2="12" y2="3"></line>
					</svg>
					<span>Download PDF</span>
				</button>
			</div>
			<iframe class="pdf-iframe" src={response.blobUrl} title="PDF Preview"></iframe>
		</div>
	{:else if isAudio && response?.blobUrl}
		<div class="media-preview-card">
			<div class="media-icon">
				<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
					<path d="M9 18V5l12-2v13"></path>
					<circle cx="6" cy="18" r="3"></circle>
					<circle cx="18" cy="16" r="3"></circle>
				</svg>
			</div>
			<div class="media-title">{displayFileName}</div>
			<div class="file-detail">{response.contentType} · {formatBytes(response.bodySizeBytes || 0)}</div>
			<audio controls src={response.blobUrl} class="audio-player"></audio>
			<button type="button" class="btn btn-sm btn-ghost" on:click={handleDownload}>Download Audio</button>
		</div>
	{:else if isVideo && response?.blobUrl}
		<div class="media-preview-card">
			<video controls src={response.blobUrl} class="video-player">
				<track kind="captions" />
			</video>
			<div class="preview-meta-bar">
				<span class="file-detail">{displayFileName} ({formatBytes(response.bodySizeBytes || 0)})</span>
				<button type="button" class="btn btn-sm btn-ghost" on:click={handleDownload}>Download Video</button>
			</div>
		</div>
	{:else if isHtml}
		<div class="iframe-container">
			<div class="sandbox-banner">
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
					<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
				</svg>
				<span>Sandboxed HTML Preview (Scripts disabled for security)</span>
			</div>
			<iframe
				class="preview-iframe"
				sandbox=""
				srcdoc={response.rawText}
				title="Sandboxed HTML Preview"
			></iframe>
		</div>
	{:else if isFile || (response?.bodySizeBytes && response.bodySizeBytes > 0)}
		<!-- Generic File / Downloadable Attachment Card -->
		<div class="file-download-card">
			<div class="file-icon-badge">
				<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
					<polyline points="13 2 13 9 20 9"></polyline>
				</svg>
			</div>
			<div class="file-info-group">
				<span class="file-name">{displayFileName}</span>
				<span class="file-mime">{response.contentType || 'Binary File Payload'}</span>
				<span class="file-size-badge">{formatBytes(response.bodySizeBytes || response.sizeBytes || 0)}</span>
			</div>
			<button type="button" class="btn btn-primary file-action-btn" on:click={handleDownload}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="7 10 12 15 17 10"></polyline>
					<line x1="12" y1="15" x2="12" y2="3"></line>
				</svg>
				<span>Download File ({formatBytes(response.bodySizeBytes || response.sizeBytes || 0)})</span>
			</button>
		</div>
	{:else}
		<div class="unsupported-preview">
			<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
				<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
				<circle cx="12" cy="12" r="3"></circle>
			</svg>
			<span class="unsupported-title">Visual preview is not supported for {response?.contentType || 'this payload'}</span>
			<span class="unsupported-sub">Please use the Pretty, Raw, or Headers tab to view this response.</span>
		</div>
	{/if}
</div>

<style>
	.preview-viewer {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
	.image-preview-card,
	.pdf-container,
	.media-preview-card,
	.file-download-card {
		display: flex;
		flex-direction: column;
		background: var(--bg-inset);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}
	.image-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		background: var(--bg-inset);
	}
	.preview-img {
		max-width: 100%;
		max-height: 440px;
		object-fit: contain;
		border-radius: 4px;
		box-shadow: var(--card-shadow);
	}
	.preview-meta-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 14px;
		background: var(--bg-surface);
		border-top: 1px solid var(--border);
		gap: 10px;
		flex-wrap: wrap;
	}
	.meta-left {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.file-tag {
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 700;
		color: var(--accent);
		background: var(--accent-soft);
		padding: 2px 7px;
		border-radius: 4px;
	}
	.file-detail {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--text-muted);
	}
	.file-size {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--text-faint);
	}
	.pdf-iframe {
		width: 100%;
		height: 520px;
		border: 0;
		background: #ffffff;
	}
	.media-preview-card {
		align-items: center;
		justify-content: center;
		padding: 36px 20px;
		text-align: center;
		gap: 12px;
	}
	.media-title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 14px;
		color: var(--text);
	}
	.audio-player {
		width: 100%;
		max-width: 440px;
	}
	.video-player {
		max-width: 100%;
		max-height: 420px;
		border-radius: 4px;
	}
	.file-download-card {
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 48px 24px;
		gap: 14px;
	}
	.file-icon-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		border-radius: var(--radius-md);
		background: var(--accent-soft);
		border: 1px solid var(--border-strong);
	}
	.file-info-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	.file-name {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 15px;
		color: var(--text);
		word-break: break-all;
	}
	.file-mime {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--text-muted);
	}
	.file-size-badge {
		font-family: var(--font-mono);
		font-size: 11.5px;
		background: var(--bg-surface);
		padding: 2px 8px;
		border-radius: 999px;
		border: 1px solid var(--border);
		color: var(--text-faint);
		margin-top: 2px;
	}
	.file-action-btn {
		margin-top: 6px;
	}
	.iframe-container {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}
	.sandbox-banner {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		background: var(--bg-surface);
		border-bottom: 1px solid var(--border);
		font-size: 11.5px;
		color: var(--text-muted);
		font-family: var(--font-display);
	}
	.preview-iframe {
		width: 100%;
		height: 440px;
		border: 0;
		background: #ffffff;
	}
	.unsupported-preview {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 48px 16px;
		background: var(--bg-inset);
		border: 1px dashed var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-muted);
		text-align: center;
	}
	.unsupported-title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 13.5px;
		color: var(--text);
	}
	.unsupported-sub {
		font-size: 12px;
		color: var(--text-faint);
	}
</style>
