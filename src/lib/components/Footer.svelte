<script>
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let heading = 'Explore our other developer tools';
	let projects = [];
	let loaded = false;

	onMount(async () => {
		try {
			const res = await fetch(`${base}/config/projects.json`);
			if (res.ok) {
				const data = await res.json();
				heading = data.heading || heading;
				projects = data.projects || [];
			}
		} catch (e) {
			// Optional configuration
		}
		loaded = true;
	});
</script>

<footer class="site-footer">
	<div class="footer-inner">
		{#if loaded && projects.length}
			<div class="explore">
				<div class="explore-heading">{heading}</div>
				<div class="project-grid">
					{#each projects as p}
						<a class="project-card" href={p.url} target="_blank" rel="noopener noreferrer">
							<span class="project-name">{p.name}</span>
							{#if p.description}<span class="project-desc">{p.description}</span>{/if}
							<span class="project-go" aria-hidden="true">↗</span>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<div class="footer-base">
			<div class="base-left">
				<span class="brand">SAM API Client</span>
				<span class="tagline">Runs 100% in your browser · No logs, storage, or telemetry.</span>
			</div>
			<div class="base-right">
				<span class="security-note">All requests are sent directly via native Fetch API.</span>
			</div>
		</div>
	</div>
</footer>

<style>
	.site-footer {
		border-top: 1px solid var(--border);
		margin-top: 48px;
		padding: 32px 0 24px;
	}
	.footer-inner {
		max-width: 1560px;
		margin: 0 auto;
		padding: 0 clamp(16px, 2.5vw, 36px);
	}
	.explore {
		margin-bottom: 24px;
	}
	.explore-heading {
		font-family: var(--font-display);
		font-size: 14px;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--text);
		margin-bottom: 12px;
	}
	.project-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 12px;
	}
	.project-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 4px;
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--card-shadow);
		padding: 14px 36px 14px 14px;
		text-decoration: none;
		transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
	}
	.project-card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
		box-shadow: var(--card-shadow-hover);
	}
	.project-name {
		font-family: var(--font-display);
		color: var(--text);
		font-weight: 600;
		font-size: 13.5px;
	}
	.project-desc {
		color: var(--text-muted);
		font-size: 12px;
		line-height: 1.4;
	}
	.project-go {
		position: absolute;
		top: 14px;
		right: 14px;
		color: var(--text-faint);
		font-size: 13px;
	}
	.project-card:hover .project-go {
		color: var(--accent);
	}
	.footer-base {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding-top: 18px;
		border-top: 1px solid var(--border);
	}
	.base-left {
		display: flex;
		align-items: baseline;
		gap: 10px;
		flex-wrap: wrap;
	}
	.brand {
		font-family: var(--font-display);
		font-weight: 700;
		color: var(--text);
		font-size: 13px;
	}
	.tagline {
		color: var(--text-muted);
		font-size: 12px;
	}
	.security-note {
		color: var(--text-faint);
		font-size: 11.5px;
		font-family: var(--font-mono);
	}
</style>

