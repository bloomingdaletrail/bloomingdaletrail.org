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
