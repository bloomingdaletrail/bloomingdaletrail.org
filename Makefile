INKSCAPE=/Applications/Inkscape.app/Contents/Resources/bin/inkscape -z

all: build

.PHONY: build serve publish

build:
	bundle exec jekyll build

serve server s:
	bundle exec jekyll serve

publish:
	aws --profile fbt s3 sync --acl public-read --exclude \*.pdf _site/ s3://www.bloomingdaletrail.org/

js/closest_access_point.js: js/src/closest_access_point.js
	babel $< > $@

img/fbt_vertical_map_v1.svg: assets/vertical_map.svg
	$(INKSCAPE) $(shell pwd)/$< --export-plain-svg=$(shell pwd)/$@ --export-text-to-path
	svgo $@
