/*
- AccessPointFinder
    - LocationForm
    - NearbyAccessPoints
        - AccessPoint
            - DistanceInfo
            - Directions
*/

try {
	function trackEvent(category, action, label, value) {
		if (window.ga !== undefined) {
			ga('send', 'event', category, action, label, value)
		}
	}

	function addListener(element, type, callback, bubble) {
		if (element.addEventListener) {
			element.addEventListener(type, callback, bubble)
		} else if (element.attachEvent) {
			element.attachEvent('on' + type, callback)
		}
	}

	// preload access point locations
	loadAccessPoints().then(accessPoints => {
		let startLoc = document.querySelector('[name="start"]');
		let options = {
			enableHighAccuracy: false,
			timeout: 10000,
			maximumAge: 90000,
		};

		if ('geolocation' in navigator) {
			// set a starting location, either geolocate, or user input
			addListener(document.querySelector('.geolocate'), 'click', e => {
				e.preventDefault()
				trackEvent('button', 'click', 'geolocate')
				resetErrors()
				activeGeoLocBtn()
				navigator.geolocation.getCurrentPosition(locationSuccess, locationErr, options)
			}, false)
		} else {
			document.querySelector('.geolocate').classList.add('hide')
		}

		function locationSuccess(loc) {
			let latLng = new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude)
			let geocoder = new google.maps.Geocoder()
			startLoc.value = `${loc.coords.latitude.toFixed(3)}, ${loc.coords.longitude.toFixed(3)}`
			startLoc.disabled = true
			geocoder.geocode({latLng}, (results, status) => {
				resetGeoLocBtn()
				startLoc.disabled = false
				if (status === google.maps.GeocoderStatus.OK) {
					if (results[0]) {
						startLoc.value = results[0].formatted_address
					}
				}
			})
		}

		function locationErr(err) {
			resetGeoLocBtn()
			let errors = document.querySelector('.errors')
			if (err.code === 1) { // permission denied
				// no-op
			} else if (err.code === 2) { // position unavailable
				errors.innerHTML = `Sorry, there was a problem getting your location. Please enter your address.`
				errors.classList.remove('hide')
			} else if (err.code === 3) { // timeout
				errors.innerHTML = `Sorry, it took too long to get your location. Please try again or enter your address.`
				errors.classList.remove('hide')
			}
		}

		function activeGeoLocBtn() {
			let btn = document.querySelector('.geolocate')
			btn.disabled = true
			let img = btn.querySelector('img')
			img.classList.remove('hide')
		}

		function resetGeoLocBtn() {
			let btn = document.querySelector('.geolocate')
			btn.disabled = false
			let img = btn.querySelector('img')
			img.classList.add('hide')
		}

		function resetErrors() {
			let errors = document.querySelector('.errors')
			errors.classList.add('hide')
			errors.innerHTML = ''
		}

		addListener(document.querySelector('.closest-access-pt form'), 'submit', e => {
			e.preventDefault()
			trackEvent('form', 'submit', 'find-access-pt')
			resetErrors()
			let mode = document.querySelector('[name="mode"]').value;
			let coords = [];
			for (let i = 0; i < accessPoints.length; i++) {
				let ap = accessPoints[i];
				coords.push(ap.geometry.coordinates);
			}
			// query google distance matrix api
			distanceMatrix(startLoc.value, coords, mode).then(response => {
				let destinations = response.destinationAddresses;
				let results = response.rows[0].elements;
				for (let i = 0; i < results.length; i++) {
					let ap = accessPoints[i];
					ap.distance = results[i].distance;
					ap.duration = results[i].duration;
					ap.address = destinations[i];
				}
				// sort by distance
				accessPoints.sort((a, b) => {
					return a.distance.value - b.distance.value;
				})
				// display top 4
				let resultsDiv = document.getElementById('closest-results');
				resultsDiv.innerHTML = `
	<div class="heading text-center">
		Starting from: <span class="start-loc">${response.originAddresses[0]}</span>
	</div>
	`;
				let closest = accessPoints.slice(0, 4);
				for (let i = 0; i < closest.length; i++) {
					let ap = closest[i];
					let html = `
						<p class=name><b>${ap.properties.TPL_NAME}</b></p>
						<p class=address>${ap.address}</p>
						<p class=distance>${ap.distance.text}</p>
						<p class=duration>${ap.duration.text}</p>`;
					if (i === 0) {
						html += '<div class="map"></div>';
					}
					let div = document.createElement('div');
					// highlight/expand nearest
					div.className = i === 0 ? 'access-pt highlighted' : 'access-pt';
					div.innerHTML = html;
					if (i === 1) {
						let banner606ap = document.createElement('img')
						banner606ap.src = '/img/606_access_pt_banner.png'
						banner606ap.classList.add('banner')
						resultsDiv.appendChild(banner606ap)
						let alsoNearby = document.createElement('div');
						alsoNearby.innerHTML = '<h4>Also nearby</h4>';
						alsoNearby.classList.add('text-center');
						alsoNearby.classList.add('also-nearby');
						resultsDiv.appendChild(alsoNearby);
					}
					resultsDiv.appendChild(div);
				}
				resultsDiv.scrollIntoView();
				window.scrollBy(0, -125);
				// query google directions api for nearest (allow user to set mode of transportation, default to driving)
				let directionsService = new google.maps.DirectionsService();
				let request = {
					origin: response.originAddresses[0],
					destination: accessPoints[0].address,
					travelMode: google.maps.TravelMode[mode],
				};
				directionsService.route(request, (result, status) => {
					if (status === google.maps.DirectionsStatus.OK) {
						let display = new google.maps.DirectionsRenderer();
						let coords = accessPoints[0].geometry.coordinates;
						let [lng, lat] = coords;
						let pt = new google.maps.LatLng(lat, lng);
						let map = new google.maps.Map(document.querySelector('.highlighted .map'), {zoom: 8, center: pt});
						display.setMap(map);
						display.setDirections(result);
					}
				})
			});
		}, false)
	})

	function loadAccessPoints() {
		return new Promise((resolve, reject) => {
			fetch('/data/access_points.json').then((xhr) => {
				resolve(JSON.parse(xhr.responseText).features);
			})
		})
	}

	function fetch(url) {
		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					resolve(xhr);
				}
			};
			xhr.open('GET', url);
			xhr.send();
		})
	}

	function distanceMatrix(startLoc, coords, mode) {
		let destinations = [];
		for (let i = 0; i < coords.length; i++) {
			let [lng, lat] = coords[i];
			destinations.push(new google.maps.LatLng(lat, lng));
		}
		let service = new google.maps.DistanceMatrixService();
		return new Promise((resolve, reject) => {
			let callback = (response, status) => {
				if (status === google.maps.DistanceMatrixStatus.OK) {
					resolve(response);
				} else {
					reject();
				}
			};
			service.getDistanceMatrix({
				origins: [startLoc],
				destinations,
				travelMode: google.maps.TravelMode[mode],
				unitSystem: google.maps.UnitSystem.IMPERIAL,
			}, callback);
		})
	}

	function serializeParams(params) {
		let rv = [];
		for (let i = 0; i < params.length; i++) {
			let [a, b] = params[i];
			rv.push([a, encodeURIComponent(b)].join('='));
		}
		return rv.join('&');
	}
} catch(err) {
	Raven.captureException(err);
}
