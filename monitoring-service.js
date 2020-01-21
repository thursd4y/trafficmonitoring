const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const request = require('request');
const turf = require('turf');
const lineIntersect = require('@turf/line-intersect').default;
const moment = require('moment');

const app = express();
const port = 3000;
const serverPort = 8080;
const serverUrl = "softeng-ws19.herokuapp.com";

// Where we will keep events
let events = [];

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Server Started!'))

app.post('/event', (req, res) => {
	var event = req.body;

	event.timeStamp = new Date().toISOString().split('Z')[0];

	event = {
		description: event.description,
		type: event.type,
		risk: event.risk * 1,
		location: {latitude: event.lat * 1, longitude: event.lng * 1},
		timeLoss: event.timeLoss,
		timeStamp: event.timeStamp
	};

	events.push(event);
	postEvent(event);

	const score = event.risk * event.timeLoss;

	if (score > 50) {
		selectAffectedRoutes(event, res);
	} else {
		//res.send("Nothing to worry about. :)");
		console.log("Nothing to worry about. :)");
	}

	// res.send('Event is added to the database');
});

app.get('/route', function (req, res) {
	const sLat = req.query.sLat;
	const sLng = req.query.sLng;
	const eLat = req.query.eLat;
	const eLng = req.query.eLng;

	console.log('https://route.api.here.com/routing/7.2/calculateroute.json?app_id=jtPgSvHS1cmG0UPrTquZ&app_code=2JsYXk-XCD2eSMD7WnCfaw&waypoint0=geo!' + sLat + ',' + sLng + '&waypoint1=geo!' + eLat + ',' + eLng + '&mode=fastest;car;traffic:disabled&representation=display');
	https.get('https://route.api.here.com/routing/7.2/calculateroute.json?app_id=jtPgSvHS1cmG0UPrTquZ&app_code=2JsYXk-XCD2eSMD7WnCfaw&waypoint0=geo!' + sLat + ',' + sLng + '&waypoint1=geo!' + eLat + ',' + eLng + '&mode=fastest;car;traffic:disabled&representation=display', (resp) => {
		let body = "";
		resp.on("data", data => {
			body += data;
		});
		resp.on("end", () => {
			generateRoute(res, JSON.parse(body.toString()).response.route[0].shape);
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});


});

app.get('/report', function (req, res) {
	const start = req.query.startDate;
	const end = req.query.endDate;

	https.get('https://' + serverUrl + '/api/events', (resp) => {
		let body = "";
		resp.on("data", data => {
			body += data;
		});
		resp.on("end", () => {
			selectEvents(res, JSON.parse(body.toString())._embedded.events, start, end);
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});


});

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));

function generateRoute(res, routeShape) {
	let routeParts = routeShape.map(shape => [shape.split(',')[1] * 1, shape.split(',')[0] * 1]);

	let route = turf.lineString(routeParts);

	res.send(route);

	postRoute(route);
}

function postRoute(route) {

	const data = {
		route,
		user: "/api/users/55"
	};

	request.post('http://' + serverUrl + '/api/routes', {json: data}, (error, res, body) => {
		if (error) {
			console.error(error)
			return
		}
		console.log(`statusCode: ${res.statusCode}`)
		console.log(body)
	})
}

function postEvent(event) {

	request.post('http://' + serverUrl + '/api/events', {json: event}, (error, res, body) => {
		if (error) {
			console.error(error)
			return
		}
		console.log(`statusCode: ${res.statusCode}`)
		console.log(body)
	})

}

function getAllRoutes(event, res) {

	console.log('https://' + serverUrl + '/api/routes');
	https.get('https://' + serverUrl + '/api/routes', (resp) => {
		let body = "";
		resp.on("data", data => {
			body += data;
		});
		resp.on("end", () => {
			handle(event, JSON.parse(body.toString())._embedded.routes, res);
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
}

function handle(event, routes, res) {
	console.log(routes);

	let routeLine;

	const eventPoint = turf.point([event.location.longitude, event.location.latitude]);
	const bufferedEvent = turf.buffer(eventPoint, (event.timeLoss/60*event.risk/2)*10);

	routes.forEach(route => {
		if(lineIntersect(bufferedEvent, route.route).features.length > 0){
			notifyUser(route.user);
		}
	});

	res.send({event, bufferedEvent, routes});
}

function selectAffectedRoutes(event, res) {
	let routes = getAllRoutes(event, res);
}

function notifyUser(user) {
	console.log("Notified user: " + user);
}

function selectEvents(res, events, start, end) {
	let selectedEvents = [];
	let selectedBuffer = [];
	let eventPoint;
	let bufferedEvent;

	events.forEach(event => {
		if(moment(event.timeStamp).isBetween(start, end)){

			eventPoint = turf.point([event.location.latitude, event.location.longitude]);
			bufferedEvent = turf.buffer(eventPoint, (event.timeLoss/60*event.risk/2)*10);
			selectedEvents.push(event);
			selectedBuffer.push(bufferedEvent)
		}
	})
	res.send({selectedEvents, selectedBuffer});

}
