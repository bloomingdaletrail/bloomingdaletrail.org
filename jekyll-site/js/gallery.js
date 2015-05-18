$(function() {
	// Gallery index
	$(".gallery.gallery-index").justifiedGallery({
		rowHeight: 240,
		margins: 5
	});

	// Gallery detail
	$(".gallery.gallery-detail").justifiedGallery({
		rowHeight: 360,
		margins: 5
	}).on("jg.complete", function() {
		$(".gallery-detail a").swipebox({
			loopAtEnd: true
		});
	});

	$('body.gallery .action-overlay-wrap').click(function(e) {
		e.preventDefault();	
		openLightbox();
	});

	if (/lightbox/.test(window.location.hash)) {
		openLightbox();
	}

	function openLightbox() {
		var images = []
		$(".gallery-detail a").each(function(i, elem) {
			images.push({
				href: $(elem).attr("href"),
				title: $(elem).attr("title")
			});
		});
		$.swipebox(images, {
			loopAtEnd: true,
			afterClose: function() {
				window.location.hash = '#';
			}
		});
	}
});
