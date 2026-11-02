<script>
	import { createEventDispatcher } from 'svelte';
	import { HTTP_METHODS } from '$lib/utils/constants.js';

	export let value = 'GET';

	const dispatch = createEventDispatcher();
	let open = false;
	let rootEl;

	$: current = HTTP_METHODS.find((m) => m.value === value) || HTTP_METHODS[0];

	function selectMethod(method) {
		value = method.value;
		open = false;
		dispatch('change', { value: method.value, hasBody: method.hasBody });
	}

	function handleWindowClick(e) {
		if (rootEl && !rootEl.contains(e.target)) open = false;
	}

	function handleKeydown(e) {
		if (e.key === 'Escape') open = false;
	}
</script>

<svelte:window on:click={handleWindowClick} on:keydown={handleKeydown} />

<div class="method-selector" bind:this={rootEl}>
	<button
		type="button"
		class="method-btn"
		class:open
		style="--curr-color: {current.color}; --curr-bg: {current.bg};"
		on:click={() => (open = !open)}
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-label="Select HTTP Method"
	>
		<span class="method-tag">{current.value}</span>
		<svg class="chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
			<path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</button>

	{#if open}
		<ul class="method-dropdown" role="listbox">
			{#each HTTP_METHODS as m}
				<li>
					<button
						type="button"
						class="method-option"
						class:active={m.value === value}
						style="--opt-color: {m.color}; --opt-bg: {m.bg};"
						on:click={() => selectMethod(m)}
						role="option"
						aria-selected={m.value === value}
					>
						<span class="opt-tag">{m.value}</span>
						{#if m.value === value}
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.method-selector {
		position: relative;
		flex-shrink: 0;
	}
	.method-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		height: 42px;
		padding: 0 14px;
		background: var(--curr-bg);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-sm) 0 0 var(--radius-sm);
		color: var(--curr-color);
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: 13.5px;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.method-btn:hover {
		border-color: var(--accent);
		filter: brightness(1.1);
	}
	.method-btn.open {
		border-color: var(--accent);
	}
	.chevron {
		color: currentColor;
		opacity: 0.8;
		transition: transform 0.15s ease;
	}
	.method-btn.open .chevron {
		transform: rotate(180deg);
	}
	.method-dropdown {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		z-index: 100;
		background: var(--bg-elevated);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-sm);
		box-shadow: var(--card-shadow-hover);
		padding: 6px;
		list-style: none;
		margin: 0;
		min-width: 140px;
	}
	.method-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 8px 10px;
		border: 0;
		border-radius: 4px;
		background: transparent;
		color: var(--opt-color);
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.12s;
	}
	.method-option:hover {
		background: var(--opt-bg);
	}
	.method-option.active {
		background: var(--opt-bg);
		box-shadow: inset 0 0 0 1px var(--opt-color);
	}
</style>

