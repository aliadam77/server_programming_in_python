var marker2;
var marker;
var arrMarkers=[];
var infowindow2;
var geocoder;
var service;
var directionsService;
var directionsRenderer;
var map;
var map2;
var pos;
var pos2;
var locations = [];
var names = [] ;
var end;

function createMarker(result){
    var marker = new google.maps.Marker({
        position: result.geometry.location,
        map: map
      });
      arrMarkers.push(marker);
      var request = {reference: result.reference};
      service.getDetails(request, function(details, status){
        if (status == google.maps.places.PlacesServiceStatus.OK) {
        var contentString = `<div id="contentf"><div id="bodyContent"> <b> ${details.name} </b> <br> ${details.formatted_address}</div> </div>`;
        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        marker.addListener('click', function() {
          infowindow.open(marker.get('map'), marker);
        });}

      });

}
function callback(results, status) {

  if (status == google.maps.places.PlacesServiceStatus.OK) {

    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}
function changeSearch()
{
    if (document.getElementById("menu-categories").value === "other") {
        document.getElementById("other_places").disabled='';
    } else {
        document.getElementById("other_places").disabled='true';
    }
}
function getPlaces(){
	directionsRenderer.setMap(null);
	for (var i = 0; i < arrMarkers.length; i++) {
		arrMarkers[i].setMap(null);
	}
	var typeSearch;
	if (document.getElementById('menu-categories').value === "other"){
			typeSearch = document.getElementById('other_places').value;
			var request = {
				location: pos2,
				radius: document.getElementById('in-radius').value,
				keyword: [`${typeSearch}`]
			};
	}
	else{
			typeSearch = document.getElementById('menu-categories').value;
			var request = {
					location: pos2,
					radius: document.getElementById('in-radius').value,
					type: [`${typeSearch}`]
				};
	}

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
	map.setCenter(pos2);

}
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert( "Geolocation is not supported by this browser.");
  }
}
function showPosition(position){

	pos = position.coords.latitude + "," + position.coords.longitude;
	pos2 = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
}
function getDirections() {
		directionsRenderer.setMap(null);
		directionsRenderer.setMap(map);

		for (var i = 0; i < arrMarkers.length; i++) {
			arrMarkers[i].setMap(null);
		}
		end = document.getElementById("desLoc").value;
		var request = {
			origin: pos,
			destination: end,
			travelMode: `${document.querySelector('input[name="dir_choice"]:checked').value}`
		};
		directionsService.route(request, function(result, status) {
			if (status == 'OK') {
				directionsRenderer.setDirections(result);
        directionsRenderer.setPanel(document.getElementById('side-panel'));
			}
		});
	}

	function initMap() {
		var myLatLng = {lat: 44.977276, lng: -93.232266};
		/* Create a map and place it on the div */
		map = new google.maps.Map(document.getElementById('map'), {
				zoom: 14.8,
				center: myLatLng
			});
		getLocation();
		directionsService = new google.maps.DirectionsService();
	  directionsRenderer = new google.maps.DirectionsRenderer();
		directionsRenderer.setMap(map);
    geocoder = new google.maps.Geocoder(); // Create a geocoder object

		var oTable = document.getElementById('Contacts');

		//gets rows of table
		var rowLength = oTable.rows.length;
		//loops through rows
		for (i = 0; i < rowLength; i++){
		   //gets cells of current row
		   if (i==0){
			   continue;
		   }
		   var oCells = oTable.rows.item(i).cells;
		   //gets amount of cells of current row
		   var cellLength = oCells.length;
		   //loops through each cell in current row
		   for(var j = 0; j < cellLength; j++){
			  /* get your cell info here */
				if (j == 0){
					names.push(oCells.item(j).innerText);
				} else if (j == 2){
					locations.push(oCells.item(j).innerText);
				}else{
				continue;}
			}
		}

		geocodeAddress(geocoder, map, locations);
	}  // end init map function definiton

	// This function takes a geocode object, a map object, and an address, and
	// if successful in finding the address, it places a marker with a callback that shows an
	// info window when the marker is "clicked"
	function geocodeAddress(geocoder, resultsMap,locations) {
		for (var i =0; i<locations.length; i++){
		geocoder.geocode({'address': locations[i]}, (function (index){
		  return function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
					resultsMap.setCenter(results[0].geometry.location);
          var iconImage = {
                        url: "Goldy.png", // url
                        scaledSize: new google.maps.Size(50, 50), // scaled size
                        origin: new google.maps.Point(0,0), // origin
                        anchor: new google.maps.Point(0, 0) // anchor
                    };
					marker2 = new google.maps.Marker({
								map: resultsMap,
								position: results[0].geometry.location,
                icon : iconImage
								});


					infowindow2 = new google.maps.InfoWindow({
								content: names[index]+'<br>'+locations[index]

								});
					arrMarkers.push(marker2);

					google.maps.event.addListener(marker2, 'click', createWindow(resultsMap,infowindow2, marker2));
			} else {
					alert('Geocode was not successful for the following reason: ' + status+ i);
			} //end if-then-else
		}
		})(i)
		);


		}//loop
	} // end geocodeAddress function

	// Function to return an anonymous function that will be called when the rmarker created in the
    // geocodeAddress function is clicked
	function createWindow(rmap, rinfowindow, rmarker){
              return function(){
				rinfowindow.open(rmap, rmarker);
            }
    }//end create (info) window
