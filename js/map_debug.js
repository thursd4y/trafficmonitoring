//map.js

//Set up some of our variables.
var map; //Will contain map object.
var marker = false; ////Has the user plotted their location marker?
var loadRoute;
var loadEvent;
var loadReport;

//Function called to initialize / create the map.
//This is called when the page has loaded.
function initMap() {

    //The center location of our map.
    var centerOfMap = new google.maps.LatLng(48.306091, 14.286440);

    //Map options.
    var options = {
      center: centerOfMap, //Set center.
      zoom: 10, //The zoom value.
      styles:[{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e0efef"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#7dcdcd"}]}]
    };

    //Create the map object.
    map = new google.maps.Map(document.getElementById('map'), options);

    //Listen for any clicks on the map.
    google.maps.event.addListener(map, 'click', function(event) {
        //Get the location that the user clicked.
		let clickedLocation = event.latLng;
        //If the marker hasn't been added.
        if(marker === false){
            //Create the marker.
            marker = new google.maps.Marker({
                position: clickedLocation,
                map: map,
                draggable: true //make it draggable
            });
            //Listen for drag events!
            google.maps.event.addListener(marker, 'dragend', function(event){
                markerLocation();
            });
        } else{
            //Marker has already been added, so just change its location.
            marker.setPosition(clickedLocation);
        }
        //Get the marker's location.
        markerLocation();
    });

    loadRoute = function (line) {
		let path = [];
		$.each(line.geometry.coordinates, function (key) {
			var wp = { lat: line.geometry.coordinates[key][1], lng: line.geometry.coordinates[key][0] }
			path.push(wp);
		});

		let polyline = new google.maps.Polyline({
			path: path
		});

		polyline.setMap(map);
	}

	loadEvent = function (data) {
		let coords = [];

		let event = {lat:data.event.location.latitude, lng: data.event.location.longitude};

		let marker = new google.maps.Marker({
			position: event,
			map: map,
			title: data.event.description
		});

		let line = data.bufferedEvent;

		$.each(line.geometry.coordinates[0], function (key) {
			let wp = { lat: line.geometry.coordinates[0][key][0], lng: line.geometry.coordinates[0][key][1] }
			coords.push(wp);
		});

		// Construct the polygon.
		let buffer = new google.maps.Polygon({
			paths: coords,
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#FF0000',
			fillOpacity: 0.35
		});
		buffer.setMap(map);

	}

	loadReport = function (data) {
		let sEvents = data.selectedEvents;
		let sBuffers = data.selectedBuffer;

		$.each(sEvents, function (key) {
			let event = {lat:sEvents[key].location.latitude, lng: sEvents[key].location.longitude};

			let marker = new google.maps.Marker({
				position: event,
				map: map,
				title: sEvents[key].description
			});
		});

		$.each(sBuffers, function (key) {
			let coords = [];

			let line = sBuffers[key];
			$.each(line.geometry.coordinates[0], function (key) {
				let wp = { lat: line.geometry.coordinates[0][key][0], lng: line.geometry.coordinates[0][key][1] }
				coords.push(wp);
			});

			// Construct the polygon.
			let buffer = new google.maps.Polygon({
				paths: coords,
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#FF0000',
				fillOpacity: 0.05
			});
			buffer.setMap(map);
		});
	}
}

//This function will get the marker's current location and then add the lat/long
//values to our textfields so that we can save the location.
function markerLocation(){
    //Get location.
	let currentLocation = marker.getPosition();
    //Add lat and lng values to a field that we can save.
    document.getElementById('lat').value = currentLocation.lat(); //latitude
    document.getElementById('lng').value = currentLocation.lng(); //longitude
}


//Load the map when the page has finished loading.
google.maps.event.addDomListener(window, 'load', initMap);
