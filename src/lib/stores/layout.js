import { writable } from 'svelte/store';

function createLayoutStore() {
	const stored = typeof window !== 'undefined' ? localStorage.getItem('sam_api_layout') : null;
	const { subscribe, set } = writable(stored === 'row' ? 'row' : 'column');

	return {
		subscribe,
		setLayout: (mode) => {
			const valid = mode === 'row' ? 'row' : 'column';
			set(valid);
			if (typeof window !== 'undefined') {
				try {
					localStorage.setItem('sam_api_layout', valid);
				} catch (e) {}
			}
		}
	};
}

export const layoutStore = createLayoutStore();

