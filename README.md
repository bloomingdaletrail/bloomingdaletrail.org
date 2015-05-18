bloomingdaletrail.org
=====================

Website for the [Friends of the Bloomingdale Trail][site]

It is a [Jekyll][jekyll] site primarily, with a subcomponent which is the
ReFraming Ruin site, which is controlled by a custom gallery generator.

Building the site
-----------------

To build bloomingdaletrail.org, install:

* [Ruby 2.1.x][ruby]
* [Go 1.4.x][go]

Then type:

``` sh
$ go get github.com/constabulary/gb/... # to install gb
$ make build
```

Serve site locally for development
----------------------------------

Install the prerequisites above, then type:

``` sh
$ make serve
```

And visit [http://127.0.0.1:4000/][lh] in your browser.

[site]: http://bloomingdaletrail.org/
[ruby]: https://www.ruby-lang.org/en/downloads/
[go]: https://golang.org/dl/
[lh]: http://127.0.0.1:4000/
[jekyll]: http://jekyllrb.com/
