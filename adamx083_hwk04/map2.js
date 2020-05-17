var map2;
function initMap2() {
  var input = document.getElementById('address');
  var autocomplete = new google.maps.places.Autocomplete(input);
  map2 = new google.maps.Map(document.getElementById('map2'), {
  center: {lat: 44.9727, lng:  -93.23540000000003},
  zoom: 14
  });

  map2.addListener('click', function(event){
    if (event.placeId) {
      event.stop();
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'location': event.latLng}, function(results, status) {
        if (status === 'OK') {
          document.getElementById("address").value = results[0].formatted_address;
        }
      });
    }
  });
}
