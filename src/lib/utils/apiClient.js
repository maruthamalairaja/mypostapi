import { prepareHeaders, prepareRequestBody, buildResolvedUrl } from './requestBuilder.js';
import { STATUS_TEXTS } from './constants.js';

/**
 * Execute an API request using native browser fetch
 * @param {object} options
 * @param {string} options.method
 * @param {string} options.url
 * @param {Array} options.params
 * @param {Array} options.headers
 * @param {string} options.bodyType
 * @param {object} options.bodyData
 * @param {object} options.authConfig
 * @param {number} options.timeoutMs
 * @param {AbortSignal} [options.externalSignal]
 * @returns {Promise<object>}
 */
export async function executeApiRequest({
	method,
	url,
	params = [],
	headers = [],
	bodyType = 'none',
	bodyData = {},
	authConfig = null,
	timeoutMs = 30000,
	externalSignal = null
}) {
	// 1. Build resolved URL
	const fullUrl = buildResolvedUrl(url, params, authConfig);

	// 2. Build headers
	const requestHeaders = prepareHeaders(headers, bodyType, authConfig);

	// 3. Build request body
	const requestBody = prepareRequestBody(method, bodyType, bodyData);

	// 4. Setup AbortController & Timeout
	const controller = new AbortController();
	let timeoutId = null;
	let isTimedOut = false;

	if (timeoutMs > 0) {
		timeoutId = setTimeout(() => {
			isTimedOut = true;
			controller.abort();
		}, timeoutMs);
	}

	// Link external signal if provided
	if (externalSignal) {
		externalSignal.addEventListener('abort', () => {
			controller.abort();
		});
	}

	const startTime = performance.now();
	const requestTimestamp = new Date().toISOString();

	try {
		const fetchOptions = {
			method: method.toUpperCase(),
			headers: requestHeaders,
			signal: controller.signal
		};

		// Only attach body if method allows body and body is present
		if (requestBody !== null && !['GET', 'HEAD'].includes(method.toUpperCase())) {
			fetchOptions.body = requestBody;
		}

		const response = await fetch(fullUrl, fetchOptions);
		const endTime = performance.now();
		const responseTimeMs = Math.round(endTime - startTime);

		if (timeoutId) clearTimeout(timeoutId);

		// Process response headers
		const responseHeaders = [];
		let headerSize = 0;
		for (const [key, value] of response.headers.entries()) {
			responseHeaders.push({ key, value });
			headerSize += key.length + value.length + 4;
		}

		const contentType = response.headers.get('content-type') || '';
		const statusText = response.statusText || STATUS_TEXTS[response.status] || 'Unknown';

		// Read response body as Blob
		const blob = await response.blob();
		const bodySize = blob.size;
		const totalSize = headerSize + bodySize;

		// Read text representation
		const rawText = await blob.text();

		// Check if JSON
		let isJson = false;
		let jsonData = null;
		let jsonError = null;

		if (contentType.toLowerCase().includes('json') || (rawText.trim().startsWith('{') || rawText.trim().startsWith('['))) {
			try {
				jsonData = JSON.parse(rawText);
				isJson = true;
			} catch (e) {
				jsonError = e.message;
			}
		}

		// Check content formats
		const ctLower = contentType.toLowerCase();
		const isHtml = ctLower.includes('html');
		const isImage = ctLower.startsWith('image/');
		const isPdf = ctLower.includes('application/pdf') || ctLower.includes('/pdf');
		const isAudio = ctLower.startsWith('audio/');
		const isVideo = ctLower.startsWith('video/');
		const isXml = ctLower.includes('xml');

		// Check Content-Disposition for filename or attachment
		const dispHeader = responseHeaders.find((h) => h.key.toLowerCase() === 'content-disposition')?.value || '';
		const hasAttachment = dispHeader.toLowerCase().includes('attachment');
		let fileName = '';
		const fnMatch = dispHeader.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/i);
		if (fnMatch && fnMatch[1]) {
			fileName = decodeURIComponent(fnMatch[1].trim());
		} else {
			try {
				const pathEnd = new URL(fullUrl).pathname.split('/').pop();
				if (pathEnd && pathEnd.includes('.')) {
					fileName = decodeURIComponent(pathEnd);
				}
			} catch (e) {}
		}

		const isBinary =
			ctLower.includes('octet-stream') ||
			ctLower.includes('zip') ||
			ctLower.includes('tar') ||
			ctLower.includes('gzip') ||
			ctLower.includes('compressed') ||
			ctLower.includes('officedocument') ||
			ctLower.includes('pdf') ||
			(!isJson && !isXml && !isHtml && !ctLower.startsWith('text/') && blob.size > 0);

		const isFile = isImage || isPdf || isAudio || isVideo || hasAttachment || isBinary;

		let blobUrl = null;
		if (isImage || isHtml || isPdf || isAudio || isVideo || blob.size > 0) {
			try {
				blobUrl = URL.createObjectURL(blob);
			} catch (e) {}
		}

		return {
			success: true,
			status: response.status,
			statusText,
			ok: response.ok,
			responseTimeMs,
			sizeBytes: totalSize,
			bodySizeBytes: bodySize,
			contentType,
			timestamp: requestTimestamp,
			headers: responseHeaders,
			rawText,
			isJson,
			jsonData,
			jsonError,
			isHtml,
			isImage,
			isPdf,
			isAudio,
			isVideo,
			isBinary,
			isFile,
			fileName,
			isXml,
			blob,
			blobUrl,
			resolvedUrl: fullUrl
		};
	} catch (err) {
		const endTime = performance.now();
		const responseTimeMs = Math.round(endTime - startTime);
		if (timeoutId) clearTimeout(timeoutId);

		if (isTimedOut) {
			return {
				success: false,
				errorType: 'TIMEOUT',
				status: 0,
				statusText: 'Timeout',
				message: `Request timed out after ${timeoutMs / 1000}s.`,
				responseTimeMs,
				timestamp: requestTimestamp,
				resolvedUrl: fullUrl
			};
		}

		if (err.name === 'AbortError' || controller.signal.aborted) {
			return {
				success: false,
				errorType: 'CANCELLED',
				status: 0,
				statusText: 'Cancelled',
				message: 'Request was cancelled by user.',
				responseTimeMs,
				timestamp: requestTimestamp,
				resolvedUrl: fullUrl
			};
		}

		// Fetch TypeError (network, CORS, certificate, offline)
		return {
			success: false,
			errorType: 'NETWORK_OR_CORS',
			status: 0,
			statusText: 'Failed',
			message: err.message || 'Network request failed',
			corsExplanation:
				'Direct browser request was blocked. This commonly occurs if the target API does not return CORS headers (Access-Control-Allow-Origin), the target server is down, or an ad-blocker blocked the call.',
			responseTimeMs,
			timestamp: requestTimestamp,
			resolvedUrl: fullUrl
		};
	}
}

