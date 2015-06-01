INKSCAPE=/Applications/Inkscape.app/Contents/Resources/bin/inkscape -z

all: build

.PHONY: build serve publish

build:
	gb build all
	bin/gallery -o jekyll-site/reframing-ruin < reframing-ruin.json
	bundle exec jekyll build -s jekyll-site -d jekyll-site/_site

serve: build
	bundle exec jekyll serve -s jekyll-site -d jekyll-site/_site

publish:
	aws --profile fbt s3 sync --acl public-read jekyll-site/_site/ s3://www.bloomingdaletrail.org/

jekyll-site/js/closest.js: jekyll-site/js/closest.js.es6
	babel $< > $@

jekyll-site/img/fbt_vertical_map_v1.svg: assets/vertical_map.svg
	$(INKSCAPE) $(shell pwd)/$< --export-plain-svg=$(shell pwd)/$@ --export-text-to-path
	svgo $@
