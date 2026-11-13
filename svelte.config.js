import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		// Using a custom domain via static/CNAME, so the site is served from the
		// domain root. If you deploy to https://username.github.io/repo-name
		// instead (no custom domain), set this to '/repo-name'.
		paths: {
			base: ''
		}
	}
};

export default config;
