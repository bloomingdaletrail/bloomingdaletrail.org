module Jekyll
    class GalleryPage < Page
        def initialize(site, base, dir, gallery, galleries)
            @site = site
            @base = base
            @dir = dir
            @name = 'index.html'
            self.process(@name)
            self.read_yaml(File.join(base, '_layouts'), 'gallery_page.html')
            self.data['gallery'] = gallery
            self.data['galleries'] = galleries
        end
    end

    class GalleryPageGenerator < Generator
        safe true

        def generate(site)
            if site.layouts.key? 'gallery_page'
                data = site.config['gallery_data_name']
                gallery_data = site.data[data]
                gallery_data['galleries'].each do |gallery|
                    dir = File.join(gallery_data['root_dir'], gallery['slug'])
                    site.pages << GalleryPage.new(site, site.source, dir, gallery, gallery_data)
                end
            end
        end
    end

    class GalleryIndexPage < Page
        def initialize(site, base, dir, gallery_data)
            @site = site
            @base = base
            @dir = dir
            @name = 'index.html'

            self.process(@name)
            self.read_yaml(File.join(base, '_layouts'), 'gallery_index.html')
            self.data['galleries'] = gallery_data
        end
    end

    class GalleryIndexPageGenerator < Generator
        safe true

        def generate(site)
            if site.layouts.key? 'gallery_index'
                data = site.config['gallery_data_name']
                gallery_data = site.data[data]
                site.pages << GalleryIndexPage.new(site, site.source, gallery_data['root_dir'], gallery_data)
            end
        end
    end

    module GalleryFilters
        def thumbnail(filename)
			idx = filename.index('.jpg')
            return filename[0...idx] + '_tn.jpg'
        end
    end
end

Liquid::Template.register_filter(Jekyll::GalleryFilters)
