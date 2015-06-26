module Jekyll

    class ParkPage < Page
        def initialize(site, base, dir, name, park)
            @site = site
            @base = base
            @dir = dir
            @name = name

            self.process(@name)
            self.read_yaml(File.join(base, '_layouts'), 'park_index.html')
            self.data['park'] = park
        end
    end

    class ParkPageGenerator < Generator
        safe true

        def generate(site)
            if site.layouts.key? 'park_index'
                dir = site.config['park_dir'] || 'parks'
                site.data['parks'].each do |park|
                    site.pages << ParkPage.new(site, site.source, File.join(dir, park['slug']), "index.html", park)
                end
            end
        end
    end

end
