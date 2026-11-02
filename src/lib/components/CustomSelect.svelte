<script>
	import { createEventDispatcher, onMount, tick } from 'svelte';

	export let value;
	export let options = [];
	export let size = 'sm'; // 'sm' | 'md'
	export let ariaLabel = '';

	const dispatch = createEventDispatcher();
	let open = false;
	let containerEl;
	let triggerBtnEl;
	let menuEl;
	let menuStyle = '';

	$: normalizedOptions = options.map((opt) =>
		typeof opt === 'object' && opt !== null
			? opt
			: { value: opt, label: String(opt) }
	);

	$: currentOption = normalizedOptions.find((o) => o.value === value);
	$: currentLabel = currentOption ? currentOption.label : String(value ?? '');

	function updatePosition() {
		if (!triggerBtnEl) return;
		const rect = triggerBtnEl.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceAbove = rect.top;
		const menuHeight = menuEl ? menuEl.offsetHeight : Math.min(normalizedOptions.length * 36 + 10, 240);

		const openUpward = spaceBelow < menuHeight + 8 && spaceAbove > spaceBelow;

		const top = openUpward
			? `${Math.max(8, rect.top - menuHeight - 4)}px`
			: `${rect.bottom + 4}px`;

		const minWidth = Math.max(rect.width, 90);
		const maxLeft = Math.max(8, window.innerWidth - minWidth - 16);
		const left = `${Math.max(8, Math.min(rect.left, maxLeft))}px`;

		menuStyle = `position: fixed; top: ${top}; left: ${left}; min-width: ${minWidth}px; z-index: 99999;`;
	}

	async function toggle() {
		open = !open;
		if (open) {
			updatePosition();
			await tick();
			updatePosition();
			requestAnimationFrame(updatePosition);
		}
	}

	function select(optVal) {
		value = optVal;
		open = false;
		dispatch('change', value);
	}

	function handleWindowClick(e) {
		if (open) {
			if (containerEl && containerEl.contains(e.target)) return;
			if (menuEl && menuEl.contains(e.target)) return;
			open = false;
		}
	}

	function handleKeydown(e) {
		if (e.key === 'Escape' && open) {
			open = false;
		}
	}

	onMount(() => {
		const onScrollOrResize = () => {
			if (open) {
				updatePosition();
			}
		};
		window.addEventListener('scroll', onScrollOrResize, true);
		window.addEventListener('resize', onScrollOrResize);
		return () => {
			window.removeEventListener('scroll', onScrollOrResize, true);
			window.removeEventListener('resize', onScrollOrResize);
		};
	});
</script>

<svelte:window on:click={handleWindowClick} on:keydown={handleKeydown} />

<div class="custom-select size-{size}" bind:this={containerEl} class:is-open={open}>
	<button
		type="button"
		class="select-trigger"
		bind:this={triggerBtnEl}
		on:click|stopPropagation={toggle}
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-label={ariaLabel || currentLabel}
	>
		<span class="trigger-label">{currentLabel}</span>
		<svg
			class="chevron"
			class:rotated={open}
			width="11"
			height="11"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</button>

	{#if open}
		<ul class="dropdown-menu" role="listbox" bind:this={menuEl} style={menuStyle}>
			{#each normalizedOptions as opt}
				<li role="presentation">
					<button
						type="button"
						role="option"
						class="option-item"
						class:is-selected={opt.value === value}
						aria-selected={opt.value === value}
						on:click|stopPropagation={() => select(opt.value)}
					>
						<span class="opt-text">{opt.label}</span>
						{#if opt.value === value}
							<svg
								class="opt-check"
								width="13"
								height="13"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
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
	.custom-select {
		position: relative;
		display: inline-block;
		user-select: none;
	}

	.select-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		background: var(--bg-surface);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-sm);
		color: var(--text);
		font-family: var(--font-body);
		cursor: pointer;
		transition: all 0.15s ease;
		outline: none;
		width: 100%;
		white-space: nowrap;
	}

	.custom-select.size-sm .select-trigger {
		padding: 4px 8px;
		font-size: 12px;
		height: 28px;
	}

	.custom-select.size-md .select-trigger {
		padding: 7px 11px;
		font-size: 13px;
		height: 36px;
	}

	.select-trigger:hover,
	.custom-select.is-open .select-trigger {
		border-color: var(--accent);
		background: var(--bg-hover);
	}

	.select-trigger:focus-visible {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-soft);
	}

	.trigger-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 500;
	}

	.chevron {
		color: var(--text-faint);
		transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease;
		flex-shrink: 0;
	}

	.custom-select.is-open .chevron {
		transform: rotate(180deg);
		color: var(--accent);
	}

	.dropdown-menu {
		position: fixed;
		width: max-content;
		max-width: 260px;
		max-height: 240px;
		overflow-y: auto;
		z-index: 99999;
		background: var(--bg-elevated);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-sm);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.15);
		padding: 4px;
		list-style: none;
		margin: 0;
		animation: dropIn 0.12s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes dropIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.option-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		gap: 10px;
		padding: 6px 10px;
		border: 0;
		border-radius: 4px;
		background: transparent;
		color: var(--text);
		font-family: var(--font-body);
		font-size: 12.5px;
		cursor: pointer;
		text-align: left;
		transition: background 0.12s, color 0.12s;
	}

	.option-item:hover {
		background: var(--accent-soft);
		color: var(--accent);
	}

	.option-item.is-selected {
		color: var(--accent);
		font-weight: 600;
		background: var(--accent-soft);
	}

	.opt-check {
		color: var(--accent);
		flex-shrink: 0;
	}
</style>

