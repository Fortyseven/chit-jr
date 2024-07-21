dev:
	cd chit-jr && npx vite build --watch

firefox-dev:
	cd firefox && web-ext run --devtools --url example.com
