export const HTTP_METHODS = [
	{ value: 'GET', color: 'var(--method-get)', bg: 'var(--method-get-bg)', hasBody: false },
	{ value: 'POST', color: 'var(--method-post)', bg: 'var(--method-post-bg)', hasBody: true },
	{ value: 'PUT', color: 'var(--method-put)', bg: 'var(--method-put-bg)', hasBody: true },
	{ value: 'PATCH', color: 'var(--method-patch)', bg: 'var(--method-patch-bg)', hasBody: true },
	{ value: 'DELETE', color: 'var(--method-delete)', bg: 'var(--method-delete-bg)', hasBody: true },
	{ value: 'HEAD', color: 'var(--method-head)', bg: 'var(--method-head-bg)', hasBody: false },
	{ value: 'OPTIONS', color: 'var(--method-options)', bg: 'var(--method-options-bg)', hasBody: false }
];

export const BODY_TYPES = [
	{ id: 'none', label: 'None', contentType: null },
	{ id: 'json', label: 'JSON', contentType: 'application/json' },
	{ id: 'text', label: 'Text', contentType: 'text/plain' },
	{ id: 'xml', label: 'XML', contentType: 'application/xml' },
	{ id: 'html', label: 'HTML', contentType: 'text/html' },
	{ id: 'javascript', label: 'JavaScript', contentType: 'application/javascript' },
	{ id: 'urlencoded', label: 'Form URL Encoded', contentType: 'application/x-www-form-urlencoded' },
	{ id: 'multipart', label: 'Multipart Form Data', contentType: null }, // Handled automatically by browser
	{ id: 'binary', label: 'Binary / File', contentType: 'application/octet-stream' }
];

export const SUGGESTED_HEADERS = [
	{ key: 'Content-Type', values: ['application/json', 'application/x-www-form-urlencoded', 'text/plain', 'application/xml', 'text/html'] },
	{ key: 'Accept', values: ['application/json, text/plain, */*', 'application/json', '*/*', 'text/html', 'application/xml'] },
	{ key: 'Authorization', values: ['Bearer ', 'Basic '] },
	{ key: 'X-API-Key', values: [''] },
	{ key: 'Cache-Control', values: ['no-cache', 'no-store', 'max-age=0'] },
	{ key: 'X-Requested-With', values: ['XMLHttpRequest'] },
	{ key: 'User-Agent', values: ['SAM-API-Client/1.0'], restricted: true, reason: 'Restricted by browser Fetch spec; browser will substitute its own User-Agent.' }
];

export const RESTRICTED_HEADERS = [
	'user-agent',
	'host',
	'referer',
	'cookie',
	'cookie2',
	'origin',
	'connection',
	'content-length',
	'keep-alive',
	'date',
	'dnt',
	'te',
	'trailer',
	'upgrade'
];

export const STATUS_TEXTS = {
	200: 'OK',
	201: 'Created',
	202: 'Accepted',
	204: 'No Content',
	301: 'Moved Permanently',
	302: 'Found',
	304: 'Not Modified',
	400: 'Bad Request',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found',
	405: 'Method Not Allowed',
	408: 'Request Timeout',
	409: 'Conflict',
	422: 'Unprocessable Entity',
	429: 'Too Many Requests',
	500: 'Internal Server Error',
	502: 'Bad Gateway',
	503: 'Service Unavailable',
	504: 'Gateway Timeout'
};

