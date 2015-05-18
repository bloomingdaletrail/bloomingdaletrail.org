package main

import (
	"encoding/json"
	"flag"
	"html/template"
	"log"
	"os"
	"path/filepath"
	"strings"
	"unicode"

	"github.com/russross/blackfriday"
)

func main() {
	var (
		outputDir       string
		imageType       string
		thumbnailSuffix string
		templatesDir    string
	)

	flag.StringVar(&outputDir, "o", "out", "output directory")
	flag.StringVar(&imageType, "i", ".jpg", "image type")
	flag.StringVar(&thumbnailSuffix, "s", "_tn.jpg", "thumbnail suffix")
	flag.StringVar(&templatesDir, "t", "templates/gallery", "templates directory")

	flag.Parse()

	funcMap := template.FuncMap{
		"markdown": func(s string) template.HTML {
			return template.HTML(blackfriday.MarkdownCommon([]byte(s)))
		},
		"thumbnail": func(filename string) string {
			idx := strings.Index(filename, imageType)
			return filename[:idx] + thumbnailSuffix
		},
		"truncate": func(s string, n int) string {
			var runes int
			for i, r := range s {
				runes++
				if runes > n && unicode.IsSpace(r) {
					return s[:i] + " …"
				}
			}
			return s
		},
		"mod": func(a, b int) int {
			return a % b
		},
		"add": func(a, b int) int {
			return a + b
		},
	}

	var app App
	if err := json.NewDecoder(os.Stdin).Decode(&app); err != nil {
		log.Fatal("parsing JSON: ", err)
	}

	// Create templates.
	templates := make(map[string]*template.Template)
	baseTemplate := template.Must(template.ParseFiles(filepath.Join(templatesDir, "base.html"))).Funcs(funcMap)
	templates["index.html"] = template.Must(template.Must(baseTemplate.Clone()).ParseFiles(filepath.Join(templatesDir, "index.html")))
	templates["gallery.html"] = template.Must(template.Must(baseTemplate.Clone()).ParseFiles(filepath.Join(templatesDir, "gallery.html")))

	// Make app index page.
	indexFile, err := os.Create(filepath.Join(outputDir, "index.html"))
	if err != nil {
		log.Fatal("opening index file for writing: ", err)
	}
	defer indexFile.Close()

	if err := templates["index.html"].ExecuteTemplate(indexFile, "base.html", app); err != nil {
		log.Fatal("executing gallery index template: ", err)
	}

	// Make individual gallery dirs and pages.
	for _, gallery := range app.Galleries {
		dir := filepath.Join(outputDir, gallery.Slug)
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Fatalf("making gallery dir %q: %s", dir, err)
		}

		f, err := os.Create(filepath.Join(dir, "index.html"))
		if err != nil {
			log.Fatal("opening gallery file for writing: ", err)
		}

		if err := templates["gallery.html"].ExecuteTemplate(f, "base.html", struct {
			App
			Gallery
		}{
			app,
			gallery,
		}); err != nil {
			log.Fatal("executing gallery template: ", err)
		}

		f.Close()
	}
}

// Photo is a photo.
type Photo struct {
	Filename string `json:"filename"`
	Caption  string `json:"caption"`
	Date     string `json:"date"`
}

// Gallery is an individual gallery, a collection of photos.
type Gallery struct {
	Name          string  `json:"name"`
	ExternalURL   string  `json:"external_url"`
	FeaturedPhoto int     `json:"featured_photo"`
	Slug          string  `json:"slug"`
	Description   string  `json:"description"`
	Photos        []Photo `json:"photos"`
}

// App is the top-level application object.
type App struct {
	SiteName        string    `json:"site_name"`
	Title           string    `json:"title"`
	Subtitle        string    `json:"subtitle"`
	FeaturedGallery int       `json:"featured_gallery"`
	Galleries       []Gallery `json:"galleries"`
	ImagePathPrefix string    `json:"img_path_prefix"`
}
