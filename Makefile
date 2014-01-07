
COMPONENT = node_modules/component/bin/component
UGLIFY = node_modules/uglify-js/bin/uglifyjs
PHANTOM = node_modules/.bin/mocha-phantomjs
LINT = node_modules/.bin/jslint

build: components lib/*.js
	$(COMPONENT) build --dev

components: component.json
	$(COMPONENT) install --dev

dist: components lib/*.js
	$(COMPONENT) build --standalone playback --out dist --name playback
	$(UGLIFY) dist/playback.js --output dist/playback.min.js

test: lint build
	$(PHANTOM) test/index.html

lint:
	$(LINT) lib/*.js

clean:
	rm -fr build components template.js

.PHONY: clean dist test
