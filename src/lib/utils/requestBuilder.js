/**
 * Generate a unique ID for list items
 */
export function uid() {
	return Math.random().toString(36).slice(2, 9);
}

/**
 * Split URL into base URL and query string
 * @param {string} fullUrl
 * @returns {{ baseUrl: string, queryString: string }}
 */
export function splitBaseAndQuery(fullUrl) {
	if (!fullUrl) return { baseUrl: '', queryString: '' };
	const qIndex = fullUrl.indexOf('?');
	if (qIndex === -1) return { baseUrl: fullUrl, queryString: '' };
	return {
		baseUrl: fullUrl.slice(0, qIndex),
		queryString: fullUrl.slice(qIndex + 1)
	};
}

/**
 * Parse query string from URL into structured params list
 * @param {string} fullUrl
 * @returns {Array<{ id: string, enabled: boolean, key: string, value: string, description: string }>}
 */
export function parseQueryParamsFromUrl(fullUrl) {
	if (!fullUrl) return [];
	const qIndex = fullUrl.indexOf('?');
	if (qIndex === -1) return [];

	const hashIndex = fullUrl.indexOf('#');
	const queryPart = fullUrl.slice(
		qIndex + 1,
		hashIndex !== -1 ? hashIndex : undefined
	);

	if (!queryPart.trim()) return [];

	const pairs = queryPart.split('&');
	return pairs
		.filter((p) => p.length > 0)
		.map((pair) => {
			const eqIndex = pair.indexOf('=');
			let rawKey = eqIndex === -1 ? pair : pair.slice(0, eqIndex);
			let rawVal = eqIndex === -1 ? '' : pair.slice(eqIndex + 1);
			try {
				rawKey = decodeURIComponent(rawKey.replace(/\+/g, ' '));
			} catch (e) {}
			try {
				rawVal = decodeURIComponent(rawVal.replace(/\+/g, ' '));
			} catch (e) {}
			return {
				id: uid(),
				enabled: true,
				key: rawKey,
				value: rawVal,
				description: ''
			};
		});
}

/**
 * Construct full URL with enabled query parameters and Auth query parameters
 * @param {string} baseUrl
 * @param {Array<{ enabled: boolean, key: string, value: string }>} params
 * @param {object} [authConfig]
 * @returns {string}
 */
export function buildResolvedUrl(baseUrl, params = [], authConfig = null) {
	if (!baseUrl) return '';
	// Strip existing query string from baseUrl
	const cleanBase = baseUrl.split('?')[0].split('#')[0];

	const activeParams = [];

	// Add enabled user params
	for (const p of params) {
		if (p.enabled && (p.key.trim() || p.value.trim())) {
			activeParams.push([p.key, p.value]);
		}
	}

	// Add API Key query param if configured
	if (
		authConfig &&
		authConfig.type === 'apikey' &&
		authConfig.apiKey.addTo === 'query' &&
		authConfig.apiKey.key.trim()
	) {
		activeParams.push([authConfig.apiKey.key.trim(), authConfig.apiKey.value || '']);
	}

	if (activeParams.length === 0) {
		return cleanBase;
	}

	const queryString = activeParams
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
		.join('&');

	return `${cleanBase}?${queryString}`;
}

/**
 * Prepare request headers
 * Merges user headers with Auth headers and Content-Type
 * @param {Array<{ enabled: boolean, key: string, value: string }>} headers
 * @param {string} bodyType
 * @param {object} authConfig
 * @returns {Headers}
 */
export function prepareHeaders(headers = [], bodyType = 'none', authConfig = null) {
	const result = new Headers();

	// 1. Add user-enabled headers
	for (const h of headers) {
		if (h.enabled && h.key && h.key.trim()) {
			const k = h.key.trim();
			// If multipart, do NOT add user Content-Type if it is multipart (let browser set boundary)
			if (bodyType === 'multipart' && k.toLowerCase() === 'content-type') {
				continue;
			}
			try {
				result.append(k, h.value ?? '');
			} catch (e) {
				// Ignore invalid header format errors in Headers API
			}
		}
	}

	// 2. Add Auth headers
	if (authConfig) {
		if (authConfig.type === 'basic' && (authConfig.basic.username || authConfig.basic.password)) {
			const creds = `${authConfig.basic.username || ''}:${authConfig.basic.password || ''}`;
			const b64 = typeof btoa !== 'undefined' ? btoa(creds) : Buffer.from(creds).toString('base64');
			result.set('Authorization', `Basic ${b64}`);
		} else if (authConfig.type === 'bearer' && authConfig.bearer.token.trim()) {
			result.set('Authorization', `Bearer ${authConfig.bearer.token.trim()}`);
		} else if (
			authConfig.type === 'apikey' &&
			authConfig.apiKey.addTo === 'header' &&
			authConfig.apiKey.key.trim()
		) {
			result.set(authConfig.apiKey.key.trim(), authConfig.apiKey.value || '');
		} else if (
			authConfig.type === 'custom' &&
			authConfig.customHeader.key.trim()
		) {
			result.set(authConfig.customHeader.key.trim(), authConfig.customHeader.value || '');
		}
	}

	return result;
}

/**
 * Prepare request body based on bodyType
 * @param {string} method
 * @param {string} bodyType
 * @param {object} bodyData
 * @returns {BodyInit|null}
 */
export function prepareRequestBody(method, bodyType, bodyData) {
	// Methods like GET, HEAD should not have body unless explicitly forced
	if (method === 'GET' || method === 'HEAD') {
		return null;
	}

	if (!bodyType || bodyType === 'none') {
		return null;
	}

	if (['json', 'text', 'xml', 'html', 'javascript'].includes(bodyType)) {
		return bodyData.raw || '';
	}

	if (bodyType === 'urlencoded') {
		const searchParams = new URLSearchParams();
		for (const row of bodyData.urlencoded || []) {
			if (row.enabled && (row.key.trim() || row.value.trim())) {
				searchParams.append(row.key, row.value);
			}
		}
		return searchParams.toString();
	}

	if (bodyType === 'multipart') {
		const formData = new FormData();
		for (const row of bodyData.multipart || []) {
			if (row.enabled && row.key.trim()) {
				if (row.type === 'file' && row.file) {
					formData.append(row.key.trim(), row.file, row.file.name);
				} else {
					formData.append(row.key.trim(), row.value || '');
				}
			}
		}
		return formData;
	}

	if (bodyType === 'binary') {
		return bodyData.binaryFile || null;
	}

	return null;
}

