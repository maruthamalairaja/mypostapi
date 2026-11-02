import { writable } from 'svelte/store';

export const toasts = writable([]);

let nextId = 1;

/**
 * Push a toast onto the queue.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {number} duration ms before auto-dismiss
 */
export function toast(message, type = 'info', duration = 3200) {
	const id = nextId++;
	toasts.update((all) => [...all, { id, message, type }]);
	setTimeout(() => dismiss(id), duration);
	return id;
}

export function dismiss(id) {
	toasts.update((all) => all.filter((t) => t.id !== id));
}

