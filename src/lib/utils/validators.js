import { RESTRICTED_HEADERS } from './constants.js';

/**
 * Validate URL string
 * @param {string} url
 * @returns {{ valid: boolean, error?: string, parsed?: URL }}
 */
export function validateUrl(url) {
	if (!url || !url.trim()) {
		return { valid: false, error: 'URL is required' };
	}
	const trimmed = url.trim();
	if (!/^https?:\/\//i.test(trimmed)) {
		return { valid: false, error: 'URL must start with http:// or https://' };
	}
	try {
		const parsed = new URL(trimmed);
		if (!parsed.hostname) {
			return { valid: false, error: 'URL must include a valid hostname' };
		}
		return { valid: true, parsed };
	} catch (e) {
		return { valid: false, error: 'Invalid URL format' };
	}
}

/**
 * Validate JSON text and locate line & column if error
 * @param {string} text
 * @returns {{ valid: boolean, error?: string, line?: number, column?: number }}
 */
export function validateJson(text) {
	if (!text || !text.trim()) {
		return { valid: true };
	}
	try {
		JSON.parse(text);
		return { valid: true };
	} catch (e) {
		let line = 1;
		let column = 1;
		const msg = e.message || 'Invalid JSON';

		// Chrome/Node format: "at position X"
		const posMatch = msg.match(/position (\d+)/i);
		if (posMatch) {
			const pos = parseInt(posMatch[1], 10);
			const lines = text.slice(0, pos).split('\n');
			line = lines.length;
			column = lines[lines.length - 1].length + 1;
		} else {
			// Firefox format: "line X column Y"
			const lineColMatch = msg.match(/line (\d+) column (\d+)/i);
			if (lineColMatch) {
				line = parseInt(lineColMatch[1], 10);
				column = parseInt(lineColMatch[2], 10);
			}
		}

		return {
			valid: false,
			error: msg,
			line,
			column
		};
	}
}

/**
 * Validate XML text
 * @param {string} xml
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateXml(xml) {
	if (!xml || !xml.trim()) return { valid: true };
	if (typeof window === 'undefined' || !window.DOMParser) return { valid: true };

	try {
		const parser = new DOMParser();
		const doc = parser.parseFromString(xml, 'application/xml');
		const parserError = doc.querySelector('parsererror');
		if (parserError) {
			const errorText = parserError.textContent || 'XML syntax error';
			return { valid: false, error: errorText.replace(/\n+/g, ' ').slice(0, 200) };
		}
		return { valid: true };
	} catch (e) {
		return { valid: false, error: e.message };
	}
}

/**
 * Check if a header name is restricted by browser Fetch specification
 * @param {string} name
 * @returns {boolean}
 */
export function isRestrictedHeader(name) {
	if (!name) return false;
	const lower = name.trim().toLowerCase();
	return (
		RESTRICTED_HEADERS.includes(lower) ||
		lower.startsWith('sec-') ||
		lower.startsWith('proxy-')
	);
}

/**
 * Validate header key
 * @param {string} key
 * @returns {{ valid: boolean, warning?: string, error?: string }}
 */
export function validateHeaderKey(key) {
	if (!key || !key.trim()) {
		return { valid: false, error: 'Header key cannot be empty' };
	}
	// Check RFC 7230 token characters
	if (!/^[!#$%&'*+\-.^_`|~0-9a-zA-Z]+$/.test(key.trim())) {
		return { valid: false, error: 'Invalid characters in header name' };
	}
	if (isRestrictedHeader(key)) {
		return {
			valid: true,
			warning: `"${key}" is restricted by browser security policies and may be ignored or overridden by the browser.`
		};
	}
	return { valid: true };
}

