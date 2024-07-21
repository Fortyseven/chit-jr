dev:
	cd chit-jr && npx vite build --watch

firefox-dev:
	cd firefox && web-ext run --devtools --url example.com

firefox-build:
	mkdir -p builds
	cd firefox && zip -r -FS ../builds/chit-firefox.xpi * --exclude '*.git*'