dev:
	cd chit-jr && npx vite build --watch

firefox-dev:
	cd firefox && web-ext run --devtools --url example.com

firefox-build:
	mkdir -p builds
	cd firefox && zip -r -FS ../builds/chit-firefox.xpi * --exclude '*.git*'

firefox-publish:
	read -p "DID YOU BUMP THE VERSION NUMBER? (y/n) " -n 1 -r
	cd chit-jr && npx vite build && cd -
	mkdir -p builds
	source .env  && cd firefox && web-ext sign --api-key="$(MOZILLA_API_KEY)" --api-secret="$(MOZILLA_API_SECRET)" --source-dir=builds --artifacts-dir=builds
