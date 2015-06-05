"use strict";

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

var AccessPoint = React.createClass({
	displayName: "AccessPoint",

	render: function render() {
		var ap = this.props.accessPoint;
		var map = ap.focused ? React.createElement("div", { className: "map" }) : null;
		var banner = ap.focused ? React.createElement("img", { src: "/img/606_access_pt_banner.png", className: "banner img-responsive center-block" }) : null;
		var classString = "access-point";
		if (ap.focused) {
			classString += " focused";
		}
		return React.createElement(
			"div",
			null,
			React.createElement(
				"div",
				{ className: classString },
				React.createElement(
					"p",
					{ className: "name" },
					React.createElement(
						"b",
						null,
						this.props.accessPoint.name
					)
				),
				React.createElement(
					"p",
					{ className: "address" },
					this.props.accessPoint.address
				),
				React.createElement(
					"p",
					{ className: "distance" },
					this.props.accessPoint.distance.text
				),
				React.createElement(
					"p",
					{ className: "duration" },
					this.props.accessPoint.duration.text
				),
				map
			),
			banner
		);
	}
});

var AccessPointList = React.createClass({
	displayName: "AccessPointList",

	handleClick: function handleClick(i) {
		console.log("you clicked " + i);
	},

	render: function render() {
		var _this = this;

		var accessPoints = this.props.accessPoints.map(function (ap, i) {
			return React.createElement(AccessPoint, { accessPoint: ap, onClick: _this.handleClick.bind(_this, i), key: i });
		});
		return React.createElement(
			"div",
			{ className: "access-point-list" },
			accessPoints
		);
	}
});

var NearbyAccessPoints = React.createClass({
	displayName: "NearbyAccessPoints",

	render: function render() {
		var closest = this.props.accessPoints[0];
		var alsoNearby = this.props.accessPoints.slice(1);
		return React.createElement(
			"div",
			{ className: "text-center" },
			React.createElement(
				"p",
				{ className: "start-loc" },
				"Starting from: ",
				this.props.lastStartLoc
			),
			React.createElement(
				"p",
				null,
				React.createElement(
					"b",
					null,
					"The closest access point is:"
				)
			),
			React.createElement(AccessPoint, { accessPoint: closest }),
			React.createElement(
				"div",
				{ className: "also-nearby" },
				React.createElement(
					"h4",
					null,
					"Also nearby"
				),
				React.createElement(AccessPointList, { accessPoints: alsoNearby })
			)
		);
	}
});

var GeolocationButton = React.createClass({
	displayName: "GeolocationButton",

	getInitialState: function getInitialState() {
		return { active: false };
	},

	handleClick: function handleClick(e) {
		var _this2 = this;

		e.preventDefault();
		this.setState({ active: true });
		trackEvent("button", "click", "geolocate");
		var options = {
			enableHighAccuracy: false,
			timeout: 10000,
			maximumAge: 90000 };
		navigator.geolocation.getCurrentPosition(function (loc) {
			_this2.setState({ active: false });
			_this2.props.onLocation(loc);
		}, function (err) {
			_this2.setState({ active: false });
			_this2.props.onError(err);
		}, options);
	},

	render: function render() {
		return React.createElement(
			"button",
			{ type: "button", className: "btn btn-default geolocate center-block", onClick: this.handleClick, disabled: this.state.active },
			React.createElement("i", { className: "fa fa-location-arrow" }),
			" Use my current location ",
			" ",
			React.createElement("img", { src: "/img/gps_spinner.gif", width: "18", height: "18", className: this.state.active ? "" : "hide" })
		);
	}
});

var LocationForm = React.createClass({
	displayName: "LocationForm",

	handleStartLocChange: function handleStartLocChange(e) {
		this.props.onStartLocChange(e.target.value);
	},

	handleLocation: function handleLocation(loc) {
		this.props.onLocation(loc);
	},

	handleLocationError: function handleLocationError(err) {
		this.props.onLocationError(err);
	},

	handleModeSelect: function handleModeSelect(e) {
		this.props.onModeChange(e.target.value);
	},

	handleSubmit: function handleSubmit(e) {
		e.preventDefault();
		trackEvent("form", "submit", "find-access-pt");
		this.props.onSubmit();
	},

	componentDidMount: function componentDidMount() {
		React.findDOMNode(this.refs.startLoc).focus();
	},

	render: function render() {
		var modes = [{ value: "BICYCLING", label: "By bicycle" }, { value: "WALKING", label: "By walking" }, { value: "TRANSIT", label: "By transit" }, { value: "DRIVING", label: "By car" }];
		var options = modes.map(function (m) {
			return React.createElement(
				"option",
				{ value: m.value },
				m.label
			);
		});
		var errors = this.props.errors ? React.createElement(
			"p",
			{ className: "text-danger" },
			this.props.errors
		) : null;
		return React.createElement(
			"form",
			{ onSubmit: this.handleSubmit },
			errors,
			React.createElement(
				"div",
				{ className: "form-group" },
				React.createElement(
					"label",
					null,
					"Starting location"
				),
				React.createElement(
					"div",
					{ className: "row" },
					React.createElement(
						"div",
						{ className: "col-sm-7" },
						React.createElement("input", { type: "text", className: "form-control", ref: "startLoc", placeholder: "Address", required: "required",
							onChange: this.handleStartLocChange, value: this.props.startLoc })
					),
					React.createElement(
						"div",
						{ className: "col-sm-5" },
						React.createElement(GeolocationButton, { onLocation: this.handleLocation, onError: this.handleLocationError })
					)
				)
			),
			React.createElement(
				"div",
				{ className: "form-group" },
				React.createElement(
					"label",
					null,
					"How do you want to get there?"
				),
				React.createElement(
					"select",
					{ name: "mode", className: "form-control", onChange: this.handleModeSelect, value: this.props.travelMode },
					options
				)
			),
			React.createElement(
				"div",
				{ className: "text-center" },
				React.createElement(
					"button",
					{ className: "btn btn-success btn-lg", type: "submit" },
					"Find closest access point"
				)
			)
		);
	}
});

var AccessPointFinder = React.createClass({
	displayName: "AccessPointFinder",

	accessPoints: [], // internal from JSON, state variable is actual access points for child components
	directionsRenderer: null,

	getInitialState: function getInitialState() {
		return {
			travelMode: "BICYCLING",
			startLoc: " Chicago, IL",
			errors: "",
			accessPoints: [],
			lastStartLoc: ""
		};
	},

	componentDidMount: function componentDidMount() {
		var _this3 = this;

		loadAccessPoints().then(function (accessPoints) {
			_this3.accessPoints = accessPoints;
		});
		this.directionsRenderer = new google.maps.DirectionsRenderer();
	},

	handleSubmit: function handleSubmit() {
		var _this4 = this;

		var nearbyAccessPoints = [];
		var coords = [];
		for (var _i = 0; _i < this.accessPoints.length; _i++) {
			coords.push(this.accessPoints[_i].geometry.coordinates);
		}
		// query google distance matrix api
		distanceMatrix(this.state.startLoc, coords, this.state.travelMode).then(function (response) {
			var destinations = response.destinationAddresses;
			var results = response.rows[0].elements;
			for (var _i2 = 0; _i2 < results.length; _i2++) {
				var ap = {
					name: _this4.accessPoints[_i2].properties.TPL_NAME,
					address: destinations[_i2],
					distance: results[_i2].distance,
					duration: results[_i2].duration };
				nearbyAccessPoints.push(ap);
			}
			// sort by distance
			nearbyAccessPoints.sort(function (a, b) {
				return a.distance.value - b.distance.value;
			});
			// display top n results
			var n = 4;
			var top = nearbyAccessPoints.slice(0, n);
			top[0].focused = true;
			_this4.setState({
				accessPoints: top,
				lastStartLoc: response.originAddresses[0] });
			React.findDOMNode(_this4.refs.nearbyList).scrollIntoView();
			window.scrollBy(0, -125);
			// query google directions api for nearest (allow user to set mode of transportation, default to driving)
			var directionsService = new google.maps.DirectionsService();
			var request = {
				origin: response.originAddresses[0],
				destination: nearbyAccessPoints[0].address,
				travelMode: google.maps.TravelMode[_this4.state.travelMode] };
			directionsService.route(request, function (result, status) {
				if (status === google.maps.DirectionsStatus.OK) {
					var _coords = _this4.accessPoints[0].geometry.coordinates;

					var _coords2 = _slicedToArray(_coords, 2);

					var lng = _coords2[0];
					var lat = _coords2[1];

					var pt = new google.maps.LatLng(lat, lng);
					var map = new google.maps.Map(document.querySelector(".access-point .map"), { zoom: 8, center: pt });
					_this4.directionsRenderer.setMap(map);
					_this4.directionsRenderer.setDirections(result);
				}
			});
		});
	},

	handleStartLocChange: function handleStartLocChange(startLoc) {
		this.setState({ startLoc: startLoc });
	},

	handleLocation: function handleLocation(loc) {
		var _this5 = this;

		this.setState({ startLoc: "" + loc.coords.latitude.toFixed(3) + ", " + loc.coords.longitude.toFixed(3), errors: "" });
		var latLng = new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude);
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({ latLng: latLng }, function (results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					_this5.setState({ startLoc: results[0].formatted_address });
				}
			}
		});
	},

	handleLocationError: function handleLocationError(err) {
		this.setState({ errors: "Sorry, there was an error getting your location. Please try again, or just enter your address." });
	},

	handleModeChange: function handleModeChange(mode) {
		this.setState({ travelMode: mode });
	},

	render: function render() {
		var nearbyAPs = this.state.accessPoints.length > 0 ? React.createElement(NearbyAccessPoints, { ref: "nearbyList",
			accessPoints: this.state.accessPoints,
			startLoc: this.state.startLoc,
			lastStartLoc: this.state.lastStartLoc }) : null;
		return React.createElement(
			"div",
			null,
			React.createElement(LocationForm, {
				startLoc: this.state.startLoc,
				onSubmit: this.handleSubmit,
				onStartLocChange: this.handleStartLocChange,
				errors: this.state.errors,
				onLocation: this.handleLocation,
				onLocationError: this.handleLocationError,
				onModeChange: this.handleModeChange,
				travelMode: this.state.travelMode }),
			nearbyAPs
		);
	}
});

React.render(React.createElement(AccessPointFinder, null), document.getElementById("access_point_finder"));

function distanceMatrix(startLoc, coords, mode) {
	var destinations = [];
	for (var _i3 = 0; _i3 < coords.length; _i3++) {
		var _coords$_i3 = _slicedToArray(coords[_i3], 2);

		var lng = _coords$_i3[0];
		var lat = _coords$_i3[1];

		destinations.push(new google.maps.LatLng(lat, lng));
	}
	var service = new google.maps.DistanceMatrixService();
	return new Promise(function (resolve, reject) {
		var callback = function callback(response, status) {
			if (status === google.maps.DistanceMatrixStatus.OK) {
				resolve(response);
			} else {
				reject();
			}
		};
		service.getDistanceMatrix({
			origins: [startLoc],
			destinations: destinations,
			travelMode: google.maps.TravelMode[mode],
			unitSystem: google.maps.UnitSystem.IMPERIAL }, callback);
	});
}

function loadAccessPoints() {
	return new Promise(function (resolve, reject) {
		fetch("/data/access_points.json").then(function (xhr) {
			resolve(JSON.parse(xhr.responseText).features);
		});
	});
}

function fetch(url) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				resolve(xhr);
			}
		};
		xhr.open("GET", url);
		xhr.send();
	});
}

function trackEvent(category, action, label, value) {
	if (window.ga !== undefined) {
		ga("send", "event", category, action, label, value);
	}
}

/*
try {
} catch(err) {
	Raven.captureException(err);
}
*/

