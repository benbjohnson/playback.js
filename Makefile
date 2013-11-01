
COMPONENT = node_modules/component/bin/component
UGLIFY = node_modules/uglify-js/bin/uglifyjs
PHANTOM = node_modules/.bin/mocha-phantomjs
LINT = node_modules/.bin/jslint

build: components lib/*.js
	@component build --dev

components: component.json
	@component install --dev

d3.player.js: components
	$(COMPONENT) build --standalone d3.player --out . --name d3.player
	$(UGLIFY) d3.player.js --output d3.player.min.js

test: lint build
	$(PHANTOM) test/index.html

lint:
	$(LINT) lib/*.js

clean:
	rm -fr build components template.js

.PHONY: clean test
