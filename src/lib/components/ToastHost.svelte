<script>
	import { toasts, dismiss } from '$lib/stores/toast.js';
</script>

<div class="toast-host" role="status" aria-live="polite">
	{#each $toasts as t (t.id)}
		<button type="button" class="toast toast-{t.type}" on:click={() => dismiss(t.id)}>
			<span class="dot"></span>
			<span class="msg">{t.message}</span>
			<span class="close-hint" aria-hidden="true">&times;</span>
		</button>
	{/each}
</div>

<style>
	.toast-host {
		position: fixed;
		bottom: 24px;
		right: 24px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		z-index: 999;
		max-width: min(380px, calc(100vw - 32px));
		pointer-events: none;
	}
	.toast {
		pointer-events: auto;
		display: flex;
		align-items: center;
		text-align: left;
		width: 100%;
		gap: 10px;
		background: var(--bg-elevated);
		border: 1px solid var(--border-strong);
		color: var(--text);
		padding: 11px 14px;
		border-radius: var(--radius-md);
		font-size: 13px;
		font-family: var(--font-body);
		box-shadow: var(--card-shadow-hover);
		cursor: pointer;
		animation: rise 0.18s cubic-bezier(0.16, 1, 0.3, 1);
		transition: transform 0.15s, border-color 0.15s;
	}
	.toast:hover {
		border-color: var(--accent);
		transform: translateY(-1px);
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
		background: var(--accent);
	}
	.toast-success .dot {
		background: var(--success);
	}
	.toast-error .dot {
		background: var(--danger);
	}
	.toast-warning .dot {
		background: var(--warning);
	}
	.toast-info .dot {
		background: var(--accent);
	}
	.msg {
		flex: 1;
		line-height: 1.35;
		word-break: break-word;
	}
	.close-hint {
		font-size: 16px;
		color: var(--text-faint);
		margin-left: 4px;
		line-height: 1;
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.toast {
			animation: none;
		}
	}
</style>

