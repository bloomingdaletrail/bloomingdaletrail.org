let AccessPoint = React.createClass({
	render(): any {
		let ap = this.props.accessPoint
		let map = ap.focused ? <div className="map"></div> : null
		let banner = ap.focused ? <img src="/img/606_access_pt_banner.png" className="banner img-responsive center-block" /> : null
		let classString = 'access-point'
		if (ap.focused) {
			classString += ' focused'
		}
		return (
			<div>
				<div className={classString}>
					<p className="name"><b>{this.props.accessPoint.name}</b></p>
					<p className="address">{this.props.accessPoint.address}</p>
					<p className="distance">{this.props.accessPoint.distance.text}</p>
					<p className="duration">{this.props.accessPoint.duration.text}</p>
					{map}
				</div>
				{banner}
			</div>
		)
	}
})

let AccessPointList = React.createClass({
	handleClick(i) {
		console.log(`you clicked ${i}`)
	},

	render(): any {
		let accessPoints = this.props.accessPoints.map((ap, i) => {
			return <AccessPoint accessPoint={ap} onClick={this.handleClick.bind(this, i)} key={i} />
		})
		return (
			<div className="access-point-list">
				{accessPoints}
			</div>
		)
	}
})

let NearbyAccessPoints = React.createClass({
	render(): any {
		let closest = this.props.accessPoints[0]
		let alsoNearby = this.props.accessPoints.slice(1)
		return (
			<div className="text-center">
				<p className="start-loc">Starting from: {this.props.lastStartLoc}</p>
				<p><b>The closest access point is:</b></p>
				<AccessPoint accessPoint={closest} />
				<div className="also-nearby">
					<h4>Also nearby</h4>
					<AccessPointList accessPoints={alsoNearby} />
				</div>
			</div>
		)
	}
})

let GeolocationButton = React.createClass({
	getInitialState() {
		return {active: false}
	},

	handleClick(e): any {
		e.preventDefault()
		this.setState({active: true})
		trackEvent('button', 'click', 'geolocate')
		let options = {
			enableHighAccuracy: false,
			timeout: 10000,
			maximumAge: 90000,
		}
		navigator.geolocation.getCurrentPosition(
			loc => { 
				this.setState({active: false})
				this.props.onLocation(loc)
			},
			err => {
				this.setState({active: false})
				this.props.onError(err)
			},
			options
		)
	},

	render(): any {
		return (
			<button type="button" className="btn btn-default geolocate center-block" onClick={this.handleClick} disabled={this.state.active}>
				<i className="fa fa-location-arrow"></i> Use my current location {' '}
				<img src="/img/gps_spinner.gif" width="18" height="18" className={this.state.active ? '' : 'hide'} />
			</button>
		)
	}
})

let LocationForm = React.createClass({
	handleStartLocChange(e) {
		this.props.onStartLocChange(e.target.value)
	},

	handleLocation(loc) {
		this.props.onLocation(loc)
	},

	handleLocationError(err) {
		this.props.onLocationError(err)
	},

	handleModeSelect(e) {
		this.props.onModeChange(e.target.value)
	},

	handleSubmit(e) {
		e.preventDefault()
		trackEvent('form', 'submit', 'find-access-pt')
		this.props.onSubmit()
	},

	componentDidMount() {
		React.findDOMNode(this.refs.startLoc).focus()
	},

	render() {
		let modes = [
			{value: "BICYCLING", label: "By bicycle"},
			{value: "WALKING", label: "By walking"},
			{value: "TRANSIT", label: "By transit"},
			{value: "DRIVING", label: "By car"},
		]
		let options = modes.map(m => {
			return <option value={m.value}>{m.label}</option>
		})
		let errors = this.props.errors ? <p className="text-danger">{this.props.errors}</p> : null
		return (
			<form onSubmit={this.handleSubmit}>
				{errors}
				<div className="form-group">
					<label>Starting location</label>
					<div className="row">
						<div className="col-sm-7">
							<input type="text" className="form-control" ref="startLoc" placeholder="Address" required="required" 
								onChange={this.handleStartLocChange} value={this.props.startLoc} />
						</div>
						<div className="col-sm-5">
							<GeolocationButton onLocation={this.handleLocation} onError={this.handleLocationError} />
						</div>
					</div>
				</div>
				<div className="form-group">
					<label>How do you want to get there?</label>
					<select name="mode" className="form-control" onChange={this.handleModeSelect} value={this.props.travelMode}>
						{options}
					</select>
				</div>
				<div className="text-center">
					<button className="btn btn-success btn-lg" type="submit">Find closest access point</button>
				</div>
			</form>
		)
	}
})

let AccessPointFinder = React.createClass({
	accessPoints: [], // internal from JSON, state variable is actual access points for child components
	directionsRenderer: null,

	getInitialState() {
		return {
			travelMode: 'BICYCLING',
			startLoc: ' Chicago, IL',
			errors: '',
			accessPoints: [],
			lastStartLoc: ''
		}
	},

	componentDidMount() {
		loadAccessPoints().then(accessPoints => {
			this.accessPoints = accessPoints
		})
		this.directionsRenderer = new google.maps.DirectionsRenderer()
	},

	handleSubmit() {
		let nearbyAccessPoints = []
		let coords = []
		for (let i = 0; i < this.accessPoints.length; i++) {
			coords.push(this.accessPoints[i].geometry.coordinates)
		}
		// query google distance matrix api
		distanceMatrix(this.state.startLoc, coords, this.state.travelMode).then(response => {
			let destinations = response.destinationAddresses
			let results = response.rows[0].elements
			for (let i = 0; i < results.length; i++) {
				let ap = {
					name: this.accessPoints[i].properties.TPL_NAME,
					address: destinations[i],
					distance: results[i].distance,
					duration: results[i].duration,
				}
				nearbyAccessPoints.push(ap)
			}
			// sort by distance
			nearbyAccessPoints.sort((a, b) => {
				return a.distance.value - b.distance.value
			})
			// display top n results
			const n = 4
			let top = nearbyAccessPoints.slice(0, n)
			top[0].focused = true
			this.setState({
				accessPoints: top,
				lastStartLoc: response.originAddresses[0],
			})
			React.findDOMNode(this.refs.nearbyList).scrollIntoView()
			window.scrollBy(0, -125)
			// query google directions api for nearest (allow user to set mode of transportation, default to driving)
			let directionsService = new google.maps.DirectionsService();
			let request = {
				origin: response.originAddresses[0],
				destination: nearbyAccessPoints[0].address,
				travelMode: google.maps.TravelMode[this.state.travelMode],
			};
			directionsService.route(request, (result, status) => {
				if (status === google.maps.DirectionsStatus.OK) {
					let coords = this.accessPoints[0].geometry.coordinates
					let [lng, lat] = coords
					let pt = new google.maps.LatLng(lat, lng)
					let map = new google.maps.Map(document.querySelector('.access-point .map'), {zoom: 8, center: pt})
					this.directionsRenderer.setMap(map)
					this.directionsRenderer.setDirections(result)
				}
			})
		})
	},

	handleStartLocChange(startLoc) {
		this.setState({startLoc: startLoc})
	},

	handleLocation(loc) {
		this.setState({startLoc: `${loc.coords.latitude.toFixed(3)}, ${loc.coords.longitude.toFixed(3)}`, errors: ''})
		let latLng = new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude)
		let geocoder = new google.maps.Geocoder()
		geocoder.geocode({latLng}, (results, status) => {
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					this.setState({startLoc: results[0].formatted_address})
				}
			}
		})
	},

	handleLocationError(err) {
		this.setState({errors: `Sorry, there was an error getting your location. Please try again, or just enter your address.`})
	},

	handleModeChange(mode) {
		this.setState({travelMode: mode})
	},

	render() {
		let nearbyAPs = this.state.accessPoints.length > 0 ?
			<NearbyAccessPoints ref="nearbyList"
				accessPoints={this.state.accessPoints}
				startLoc={this.state.startLoc}
				lastStartLoc={this.state.lastStartLoc} /> :
			null
		return (
			<div>
				<LocationForm
					startLoc={this.state.startLoc}
					onSubmit={this.handleSubmit}
					onStartLocChange={this.handleStartLocChange}
					errors={this.state.errors}
					onLocation={this.handleLocation}
					onLocationError={this.handleLocationError}
					onModeChange={this.handleModeChange}
					travelMode={this.state.travelMode} />
				{nearbyAPs}
			</div>
		)
	}
})

React.render(<AccessPointFinder />, document.getElementById('access_point_finder'))

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

function trackEvent(category, action, label, value) {
	if (window.ga !== undefined) {
		ga('send', 'event', category, action, label, value)
	}
}

/*
try {
} catch(err) {
	Raven.captureException(err);
}
*/
