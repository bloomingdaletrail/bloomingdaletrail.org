all: build

.PHONY: build serve publish

build:
	gb build all
	bin/gallery -o jekyll-site/reframing-ruin < reframing-ruin.json
	bundle exec jekyll build -s jekyll-site -d jekyll-site/_site

serve: build
	bundle exec jekyll serve -s jekyll-site -d jekyll-site/_site

publish:
	s3cmd -P sync jekyll-site/_site/ s3://friendsofthebloomingdaletrail/
