class Map {
	constructor(element, extent) {
		this.element = element
		this.extent = extent
		this.size = [element.offsetWidth, element.offsetHeight]
		this.addListener()
		this.moveCallback = null
	}

	addListener() {
		this.element.addEventListener('mousemove', e => {
			let [lng, lat] = this.pt2coord([e.offsetX, e.offsetY])
			//console.debug(lng, lat)
			if (this.moveCallback !== null) {
				this.moveCallback([lng, lat], e)
			}
		}, true);
	}

	handleMove(callback) {
		this.moveCallback = callback
	}

	pt2coord(pt) {
		// x track with lat, y with lng because of the vertical map
		let [x, y] = pt
		let [w, h] = this.size
		let pcX = x / w
		let pcY = y / h
		let [minLng, minLat, maxLng, maxLat] = this.extent
		let lng = ((maxLng - minLng) * pcY) + minLng
		let lat = ((maxLat - minLat) * pcX) + minLat
		return [lng, lat]
	}

	coord2pt(coord) {
		// x track with lat, y with lng because of the vertical map
		let [lng, lat] = coord
		let [minLng, minLat, maxLng, maxLat] = this.extent
		let pcX = (lat-minLat)/(maxLat-minLat)
		let pcY = (lng-minLng)/(maxLng-minLng)
		let [w, h] = this.size
		let x = pcX * w
		let y = pcY * h
		return [x, y]
	}
}

let extent = [-87.72935, 41.90070, -87.65787, 41.92480]
let map = new Map(document.querySelector('.map'), extent)
let accessPtJson = `
{
"type": "FeatureCollection",
"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                                                                                
"features": [
{ "type": "Feature", "properties": { "NAME": "Ridgeway - Logan Square YMCA", "ACCESSTYPE": "Trailhead", "TPL_NAME": "Ridgeway Trailhead" }, "geometry": { "type": "Point", "coordinates": [ -87.720286040615861, 41.913639763940239 ] } },
{ "type": "Feature", "properties": { "NAME": "Albany \/ Whipple", "ACCESSTYPE": "Access", "TPL_NAME": "Julia de Burgos Park" }, "geometry": { "type": "Point", "coordinates": [ -87.704552644976843, 41.913813518117855 ] } },
{ "type": "Feature", "properties": { "NAME": "Milwaukee \/ Leavitt", "ACCESSTYPE": "Access", "TPL_NAME": "Park 567 Milwaukee \/ Leavitt" }, "geometry": { "type": "Point", "coordinates": [ -87.683365711936716, 41.913965071629988 ] } },
{ "type": "Feature", "properties": { "NAME": "Damen - Churchill Park", "ACCESSTYPE": "Access", "TPL_NAME": "Churchill Field" }, "geometry": { "type": "Point", "coordinates": [ -87.67696614093542, 41.914094133802131 ] } },
{ "type": "Feature", "properties": { "NAME": "Ashland - Walsh Park", "ACCESSTYPE": "Trailhead", "TPL_NAME": "Walsh Park" }, "geometry": { "type": "Point", "coordinates": [ -87.668090484125486, 41.914237720432652 ] } },
{ "type": "Feature", "properties": { "NAME": "Drake Access Ramp", "ACCESSTYPE": "Access", "TPL_NAME": "Drake Access Ramp" }, "geometry": { "type": "Point", "coordinates": [ -87.71505, 41.913559999997432 ] } },
{ "type": "Feature", "properties": { "NAME": "Humboldt Ramp", "ACCESSTYPE": "Access", "TPL_NAME": "Humboldt Access Ramp" }, "geometry": { "type": "Point", "coordinates": [ -87.70186673574652, 41.913816063130334 ] } },
{ "type": "Feature", "properties": { "NAME": "Rockwell Ramp", "ACCESSTYPE": "Access", "TPL_NAME": "Rockwell Access Ramp" }, "geometry": { "type": "Point", "coordinates": [ -87.69217, 41.913949999997435 ] } },
{ "type": "Feature", "properties": { "NAME": "Western Ramp", "ACCESSTYPE": "Access", "TPL_NAME": "Western Access Ramp" }, "geometry": { "type": "Point", "coordinates": [ -87.687263, 41.913915999997435 ] } },
{ "type": "Feature", "properties": { "NAME": "California Ramp", "ACCESSTYPE": "Access", "TPL_NAME": "California Access Ramp" }, "geometry": { "type": "Point", "coordinates": [ -87.69706, 41.913899999997426 ] } },
{ "type": "Feature", "properties": { "NAME": "Wood Ramp", "ACCESSTYPE": "Access", "TPL_NAME": "Wood Access Ramp" }, "geometry": { "type": "Point", "coordinates": [ -87.67266, 41.914209999997425 ] } },
{ "type": "Feature", "properties": { "NAME": "Spaulding Access Ramp", "ACCESSTYPE": "Access", "TPL_NAME": "Spaulding Access Ramp" }, "geometry": { "type": "Point", "coordinates": [ -87.710153116268444, 41.913728462358442 ] } }
]
}`
let accessPoints = JSON.parse(accessPtJson).features
let popup = document.querySelector('.popup')
map.handleMove((coord, e) => {
	let [lng, lat] = coord
	let buf = 0.0005
	let found = null
	for (let i = 0; i < accessPoints.length; i++) {
		let ap = accessPoints[i]
		let coords = ap.geometry.coordinates
		if (Math.abs(coords[0] - lng) <= buf && Math.abs(coords[1] - lat) <= buf) {
			found = ap
			break
		}
	}
	if (found !== null) {
		popup.innerHTML = `<p class=name>${found.properties.TPL_NAME}</p>`
		popup.style.top = (e.offsetY-10) + 'px'
		popup.style.left = '20px'
	} else {
		popup.innerHTML = ''
	}
})


/*
let canvas = document.querySelector('canvas')
let ctx = canvas.getContext('2d')
accessPoints.forEach(ap => {
	let [lng, lat] = ap.geometry.coordinates
	let [x, y] = map.coord2pt([lng, lat])
	console.log(x, y, ap.properties.TPL_NAME)
	ctx.beginPath()
	ctx.arc(x, y, 8.0, 0, Math.PI*2, false)
	ctx.closePath()
	ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'
	ctx.fill()
})
*/
