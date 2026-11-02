/**
 * Format bytes to readable string (e.g. 1.25 KB)
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
	if (bytes === 0 || bytes === null || bytes === undefined || isNaN(bytes)) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	const val = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
	return `${val} ${sizes[i] || 'B'}`;
}

/**
 * Format milliseconds to readable string (e.g. 142 ms or 1.24 s)
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
	if (ms === null || ms === undefined || isNaN(ms)) return '0 ms';
	if (ms < 1000) return `${Math.round(ms)} ms`;
	return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Pretty-print JSON string with 2-space indentation
 * @param {string} text
 * @returns {{ success: boolean, formatted?: string, error?: string }}
 */
export function formatJson(text) {
	if (!text || !text.trim()) return { success: true, formatted: '' };
	try {
		const parsed = JSON.parse(text);
		return { success: true, formatted: JSON.stringify(parsed, null, 2) };
	} catch (e) {
		return { success: false, error: e.message };
	}
}

/**
 * Minify JSON string
 * @param {string} text
 * @returns {{ success: boolean, minified?: string, error?: string }}
 */
export function minifyJson(text) {
	if (!text || !text.trim()) return { success: true, minified: '' };
	try {
		const parsed = JSON.parse(text);
		return { success: true, minified: JSON.stringify(parsed) };
	} catch (e) {
		return { success: false, error: e.message };
	}
}

/**
 * Cleanly format XML string
 * @param {string} xml
 * @returns {string}
 */
export function formatXml(xml) {
	if (!xml || !xml.trim()) return '';
	let formatted = '';
	let pad = 0;
	// Clean extra whitespace between tags
	const reg = /(>)(<)(\/*)/g;
	const cleanXml = xml.replace(reg, '$1\r\n$2$3');
	const lines = cleanXml.split('\r\n');

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i].trim();
		if (!line) continue;
		let indent = 0;
		if (line.match(/.+<\/\w[^>]*>$/)) {
			indent = 0;
		} else if (line.match(/^<\/\w/)) {
			if (pad !== 0) pad -= 1;
		} else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
			indent = 1;
		} else {
			indent = 0;
		}

		formatted += '  '.repeat(pad) + line + '\n';
		pad += indent;
	}
	return formatted.trim();
}

/**
 * Fast, secure, lightweight syntax highlighter for JSON
 * @param {string|object} json
 * @returns {string} HTML string
 */
export function highlightJson(json) {
	if (typeof json !== 'string') {
		try {
			json = JSON.stringify(json, null, 2);
		} catch (e) {
			json = String(json);
		}
	}
	if (!json) return '';

	// Escape HTML
	const escaped = json
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	return escaped.replace(
		/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
		function (match) {
			let cls = 'json-number';
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
					cls = 'json-key';
				} else {
					cls = 'json-string';
				}
			} else if (/true|false/.test(match)) {
				cls = 'json-boolean';
			} else if (/null/.test(match)) {
				cls = 'json-null';
			}
			return `<span class="${cls}">${match}</span>`;
		}
	);
}

